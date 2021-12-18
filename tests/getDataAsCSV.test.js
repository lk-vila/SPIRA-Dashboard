const MockDate = require("mockdate");
const db = require("../util/database");
const request = require("supertest");
const { MongoClient } = require("mongodb");
const { app } = require("../app");

const mockArray = jest.fn()

const mockCollection = {
    find: jest.fn(() => ({
        project: jest.fn(() => ({
            toArray: mockArray
        }))
    }))
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

describe("GET /dump/:tableName", () => {
    let response;

    beforeAll(() => {
        MockDate.set("2022-01-01 00:00:00");
    });

    afterAll(() => {
        MockDate.reset();
    });

    beforeEach(() => {
        jest.spyOn(MongoClient, "connect").mockResolvedValue(mockConnection);

        db.collections = {
            audio: mockCollection,
            inference: mockCollection,
        };
    })

    describe("when tableName is inference", () => {
        const inference1 = {
            timestamp: '1639855364829',
            original_name: "audio1.wav",
            sex: "F",
            age: "28",
            level: "4",
            result: "0.875",
            audio_hash: "lfcknm9f34mf802exwqwoxm29i3i"
        };
        const inference2 = {
            timestamp: '1639855364829',
            original_name: "audio2.wav",
            sex: "M",
            age: "45",
            level: "2",
            result: "0.123",
            audio_hash: "32oim29gn923ifrk93xk9403e0c3c"
        };

        beforeEach(async () => {
            mockArray.mockReturnValue([inference1, inference2])

            response = await request(app).get("/dump/inference")
                .buffer()
                .parse((res, callback) => {
                    res.setEncoding('binary')
                    res.data = ""
                    res.on("data", (chunk) => {
                        res.data += chunk
                    })
                    res.on("end", () => callback(null, Buffer.from(res.data), "binary"))
                })
        })

        it("creates the file as a .csv", () => {
            let expectedCSV = ""
            expectedCSV += `"timestamp","original_name","sex","age","level","result","audio_hash"\n`;
            expectedCSV += `"1639855364829","audio1.wav","F","28","4","0.875","lfcknm9f34mf802exwqwoxm29i3i"\n`;
            expectedCSV += `"1639855364829","audio2.wav","M","45","2","0.123","32oim29gn923ifrk93xk9403e0c3c"`;

            expect(response.body.toString()).toEqual(expectedCSV)
        })
    })

    describe("when tableName is audio", () => {
        const audio1 = {
            date: '1639856093524',
            original_name: "audio1.wav",
            recent_name: "audio.wav",
            hash: "lfcknm9f34mf802exwqwoxm29i3i"
        };
        const audio2 = {
            date: '1639856093524',
            original_name: "audio2.wav",
            recent_name: "x1w98xd198.wav",
            hash: "32oim29gn923ifrk93xk9403e0c3c"
        };

        beforeEach(async () => {
            mockArray.mockReturnValue([audio1, audio2])

            response = await request(app).get("/dump/audio")
                .buffer()
                .parse((res, callback) => {
                    res.setEncoding('binary')
                    res.data = ""
                    res.on("data", (chunk) => {
                        res.data += chunk
                    })
                    res.on("end", () => callback(null, Buffer.from(res.data), "binary"))
                })
        })

        it("creates the file as a .csv", () => {
            let expectedCSV = ""
            expectedCSV += `"date","original_name","recent_name","hash"\n`;
            expectedCSV += `"1639856093524","audio1.wav","audio.wav","lfcknm9f34mf802exwqwoxm29i3i"\n`;
            expectedCSV += `"1639856093524","audio2.wav","x1w98xd198.wav","32oim29gn923ifrk93xk9403e0c3c"`;

            expect(response.body.toString()).toEqual(expectedCSV)
        })
    })
})