const MockDate = require("mockdate");
const axios = require("axios");
const db = require("../util/database");
const fs = require("fs");
const request = require("supertest");
const shasum = require("shasum");
const { getApp } = require("../app");

const spiraApiMock = jest
    .fn()
    .mockResolvedValue({ data: { resultado: 0.999 } });

const mockCollection = {
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn()
};

const mockDb = {
    collection: jest.fn(() => mockCollection),
};

const mockClient = {
    db: jest.fn(() => mockDb),
};

jest.mock("axios");
jest.mock("../util/database.ts");

const app = getApp({ mockClient })

describe("POST /predict", () => {
    let response;

    beforeAll(() => {
        MockDate.set("2022-01-01 00:00:00");
    });

    afterAll(() => {
        MockDate.reset();
    });

    beforeEach(async () => {
        jest.spyOn(axios, "post").mockImplementation(spiraApiMock);
        jest.spyOn(db, 'getCollections').mockImplementation(() => ({
            audio: mockCollection,
            inference: mockCollection,
        }))

        response = await request(app)
            .post("/predict")
            .field("descricao", "essa descricao é um teste x013xn019dww2k@peo1o0c,fp3")
            .field("sexo", "M")
            .field("idade", 25)
            .field("nivel_falta_de_ar", 2)
            .attach("audio", "tests/fixtures/sample.wav");
    });

    it("gets prediction from spira API", () => {
        expect(spiraApiMock).toBeCalled();
    });

    it("returns status code 200", () => {
        expect(response.statusCode).toEqual(200);
    });

    it("renders response from spira API in HTML", () => {
        expect(response.text).toMatch('A probabilidade de insuficiência respiratória calculada é:')
        expect(response.text).toMatch('99.90\%')
    });

    it("saves audio data", () => {
        expect(mockCollection.insertOne).toBeCalledWith({
            date: new Date().toISOString(),
            original_name: 'sample.wav',
            recent_name: 'sample.wav',
            hash: '92aff6ffe140da201a4a94cb3c3b9e1ff0b2a25a'
        });
    });

    it("saves inference data", () => {
        expect(mockCollection.insertOne).toBeCalledWith({
            timestamp: new Date().toISOString(),
            description: "essa descricao é um teste x013xn019dww2k@peo1o0c,fp3",
            sex: "M",
            age: "25",
            level: "2",
            audio_hash: '92aff6ffe140da201a4a94cb3c3b9e1ff0b2a25a',
            result: "0.999",
        });
    });

    describe("when audio file is missing", () => {
        beforeEach(async () => {
            jest.spyOn(axios, "post").mockRejectedValueOnce(
                new Error("Invalid audio")
            );

            response = await request(app)
                .post("/predict")
                .field("sexo", "M")
                .field("idade", 25)
                .field("descricao", "essa descricao é um teste x013xn019dww2k@peo1o0c,fp3")
                .field("nivel_falta_de_ar", 2)
                .attach("audio", "tests/fixtures/sample.wav");
        });

        it("returns status code 400", () => {
            expect(response.statusCode).toEqual(400);
        });

        it("serializes error message", () => {
            expect(response.body).toEqual({ error: "Error: Invalid audio" });
        });
    });

    describe("when it fails to predict data using spira API", () => {
        beforeEach(async () => {
            response = await request(app)
                .post("/predict")
                .field("sexo", "M")
                .field("idade", 25)
                .field("descricao", "essa descricao é um teste x013xn019dww2k@peo1o0c,fp3")
                .field("nivel_falta_de_ar", 2);
        });

        it("returns status code 400", () => {
            expect(response.statusCode).toEqual(400);
        });

        it("serializes error message", () => {
            expect(response.body).toEqual({ error: "No audio file sent" });
        });
    });

    describe("when audio file is already in database", () => {
        let hash;

        beforeEach(async () => {
            hash = shasum(fs.readFileSync("tests/fixtures/sample.wav"));

            mockCollection.findOne.mockImplementation(() => ({
                date: new Date().toISOString(),
                recent_name: 'original_name.wav',
                original_name: "original_name.wav",
                hash: '92aff6ffe140da201a4a94cb3c3b9e1ff0b2a25a'
            }));

            response = await request(app)
                .post("/predict")
                .field("sexo", "M")
                .field("idade", 25)
                .field("descricao", "essa descricao é um teste x013xn019dww2k@peo1o0c,fp3")
                .field("nivel_falta_de_ar", 2)
                .attach("audio", "tests/fixtures/sample.wav");
        });

        it("saves inference data using original audio name", async () => {
            expect(mockCollection.insertOne).toBeCalledWith({
                timestamp: new Date().toISOString(),
                description: "essa descricao é um teste x013xn019dww2k@peo1o0c,fp3",
                sex: "M",
                age: "25",
                level: "2",
                audio_hash: '92aff6ffe140da201a4a94cb3c3b9e1ff0b2a25a',
                result: "0.999",
            });
        });

        it("does not save audio data again", async () => {
            expect(mockCollection.updateOne).toBeCalledWith(
                { hash: '92aff6ffe140da201a4a94cb3c3b9e1ff0b2a25a' },
                { $set: { recent_name: 'sample.wav' } }
            )
        });
    });
    
});
