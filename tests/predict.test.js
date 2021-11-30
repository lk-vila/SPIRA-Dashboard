const request = require("supertest");
const axios = require("axios");
const { collections } = require("../util/database");
const { app } = require("../app");

const spiraApiMock = jest
    .fn()
    .mockResolvedValue({ data: { resultado: 0.999 } });

jest.mock("axios");

describe("POST /predict", () => {
    let response;

    beforeEach(async () => {
        jest.spyOn(axios, "post").mockImplementation(spiraApiMock);

        response = await request(app)
            .post("/predict")
            .field("sexo", "M")
            .field("idade", 25)
            .field("nivel_falta_de_ar", 2)
            .attach("audio", "tests/fixtures/sample.wav");
    });

    it("predicts using spira API", async () => {
        expect(spiraApiMock).toBeCalled();
    });

    it("returns status 200", async () => {
        expect(response.statusCode).toEqual(200);
    });
});
