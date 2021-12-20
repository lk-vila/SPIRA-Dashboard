const db = require("../util/database");
const request = require("supertest");
const { MongoClient } = require("mongodb");
const { app } = require("../app");

const mockFind = {
    toArray: jest.fn(),
};

const mockCollection = {
    find: () => mockFind,
    findOne: jest.fn(),
    insertOne: jest.fn(),
};

const mockDb = {
    collection: jest.fn(() => mockCollection),
};

const mockConnection = {
    db: jest.fn(() => mockDb),
};

jest.mock("mongodb");

describe("GET /table inference", () => {
    const inference1 = {
        timestamp: Date.now().toString(),
        original_name: "audio1.wav",
        sex: "F",
        age: "28",
        level: "4",
        result: "0.875",
        audio_hash: "lfcknm9f34mf802exwqwoxm29i3i"
    };
    const inference2 = {
        timestamp: Date.now().toString(),
        original_name: "audio2.wav",
        sex: "M",
        age: "45",
        level: "2",
        result: "0.123",
        audio_hash: "32oim29gn923ifrk93xk9403e0c3c"
    };

    beforeEach(async () => {
        jest.spyOn(MongoClient, "connect").mockResolvedValue(mockConnection);

        mockFind.toArray.mockImplementation(() => [inference1, inference2]);

        db.collections = {
            audio: mockCollection,
            inference: mockCollection,
        };
    });

    it("renders inference table header", async () => {
        const response = await request(app).get("/table");

        expect(response.text).toMatch(/Data/);
        expect(response.text).toMatch(/Nome/);
        expect(response.text).toMatch(/Sexo/);
        expect(response.text).toMatch(/Idade/);
        expect(response.text).toMatch(/Nível falta de ar/);
        expect(response.text).toMatch(/Resultado/);
        expect(response.text).toMatch(/SHA-1 do áudio/);
    });

    it("renders one table row for each inference", async () => {
        const response = await request(app).get("/table");
        const occurences = response.text.match(/inference\-row/g).length;

        expect(occurences).toBe(2);
    });

    it("renders the correct type for each field", async () => {
        const response = await request(app).get("/table");

        expect(response.text).toMatch(inference1.timestamp);
        expect(response.text).toMatch(inference1.original_name);
        expect(response.text).toMatch(inference1.sex);
        expect(response.text).toMatch(inference1.age);
        expect(response.text).toMatch(inference1.level);
        expect(response.text).toMatch(inference1.result);
        expect(response.text).toMatch(inference1.audio_hash);

        expect(response.text).toMatch(inference2.timestamp);
        expect(response.text).toMatch(inference2.original_name);
        expect(response.text).toMatch(inference2.sex);
        expect(response.text).toMatch(inference2.age);
        expect(response.text).toMatch(inference2.level);
        expect(response.text).toMatch(inference2.audio_hash);
    });

    
});

describe("GET /table audio", () => {
    const audio1 = {
        date: Date.now().toString(),
        original_name: "audio1.wav",
        recent_name: "audio.wav",
        hash: "lfcknm9f34mf802exwqwoxm29i3i"
    };
    const audio2 = {
        date: Date.now().toString(),
        original_name: "audio2.wav",
        recent_name: "x1w98xd198.wav",
        hash: "32oim29gn923ifrk93xk9403e0c3c"
    };

    beforeEach(async () => {
        jest.spyOn(MongoClient, "connect").mockResolvedValue(mockConnection);

        mockFind.toArray.mockImplementation(() => [audio1, audio2]);

        db.collections = {
            audio: mockCollection,
            inference: mockCollection,
        };
    });

    it("renders inference table header", async () => {
        const response = await request(app).get("/table");
        expect(response.text).toMatch(/Data da primeira submissão/);
        expect(response.text).toMatch(/Nome original do áudio/);
        expect(response.text).toMatch(/Nome na última submissão/);
        expect(response.text).toMatch(/SHA-1/);

    });

    it("renders one table row for each audio", async () => {
        const response = await request(app).get("/table");
        const occurences = response.text.match(/audio\-row/g).length;

        expect(occurences).toBe(2);
    });

    it("renders the correct type for each field", async () => {
        const response = await request(app).get("/table");

        expect(response.text).toMatch(audio1.date);
        expect(response.text).toMatch(audio1.original_name);
        expect(response.text).toMatch(audio1.recent_name);
        expect(response.text).toMatch(audio1.hash);

        expect(response.text).toMatch(audio2.date);
        expect(response.text).toMatch(audio2.original_name);
        expect(response.text).toMatch(audio2.recent_name);
        expect(response.text).toMatch(audio2.hash);
    });
});
