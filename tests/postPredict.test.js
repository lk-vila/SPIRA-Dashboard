const MockDate = require("mockdate");
const axios = require("axios");
const db = require("../util/database");
const fs = require("fs");
const request = require("supertest");
const shasum = require("shasum");
const { MongoClient } = require("mongodb");
const { app } = require("../app");

const spiraApiMock = jest
    .fn()
    .mockResolvedValue({ data: { resultado: 0.999 } });

const mockCollection = {
    findOne: jest.fn(),
    insertOne: jest.fn(),
};

const mockDb = {
    collection: jest.fn(() => mockCollection),
};

const mockConnection = {
    db: jest.fn(() => mockDb),
};

jest.mock("axios");
jest.mock("../util/database.ts");
jest.mock("mongodb");

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
        jest.spyOn(MongoClient, "connect").mockResolvedValue(mockConnection);

        db.collections = {
            audio: mockCollection,
            inference: mockCollection,
        };

        response = await request(app)
            .post("/predict")
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

    it("serializes response from spira API", () => {
        expect(response.body).toEqual({
            resultado: 0.999,
        });
    });

    it("saves audio data", () => {
        const audioFile = fs.readFileSync("tests/fixtures/sample.wav");

        expect(mockCollection.insertOne).toBeCalledWith({
            hash: shasum(audioFile),
            original_name: "sample.wav",
        });
    });

    it("saves inference data", () => {
        expect(mockCollection.insertOne).toBeCalledWith({
            timestamp: Date.now().toString(),
            audio_name: "sample.wav",
            sex: "M",
            age: "25",
            level: "2",
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
                hash,
                original_name: "original_name.wav",
            }));

            response = await request(app)
                .post("/predict")
                .field("sexo", "M")
                .field("idade", 25)
                .field("nivel_falta_de_ar", 2)
                .attach("audio", "tests/fixtures/sample.wav");
        });

        it("saves inference data using original audio name", async () => {
            expect(mockCollection.insertOne).toBeCalledWith({
                timestamp: Date.now().toString(),
                audio_name: "original_name.wav",
                sex: "M",
                age: "25",
                level: "2",
                result: "0.999",
            });
        });

        it("does not save audio data again", async () => {
            expect(mockCollection.insertOne).not.toBeCalledWith({
                hash,
                original_name: "sample.wav",
            });
        });
    });
});
