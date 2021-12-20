const request = require("supertest");
const { getApp } = require("../app");

const mockClient = jest.fn()

const app = getApp({ mockClient })

describe('GET /', () => {
    it('renders form fields', async () => {
        const response = await request(app).get("/");

        expect(response.text).toMatch(/Sexo/);
        expect(response.text).toMatch(/Masculino/);
        expect(response.text).toMatch(/Feminino/);
        expect(response.text).toMatch(/Idade/);
        expect(response.text).toMatch(/Nível de falta de ar/);
        expect(response.text).toMatch(/Descrição \(opcional\)/);
        expect(response.text).toMatch(/Selecione um áudio/);
        expect(response.text).toMatch(/Enviar/);
    })
})