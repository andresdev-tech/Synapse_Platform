import request from 'supertest';
import { describe, it, expect } from 'vitest'
import app from '../../src/app'

// registro exitoso 
describe("POST /auth/registro", () => {
    it("Deberia registrar correctamente", async () => {
        const response = await request(app)
            .post("/api/v1/auth/registro")
            .send({
                nombres: "Samuel",
                apellidos: "Moreno",
                tipo_documento_id: 2,
                numero_documento: "1234567098",
                fecha_nacimiento: "2007-06-15",
                correo_electronico: "samuel@gmail.com",
                password: "Samuel123@",
                rol: 3
            });

        expect(response.status).toBe(201);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("token");
    });
});

// email duplicado
describe("POST /auth/registro", () => {
    it("Deberia rechazar la solocitud, por correo duplicado", async () => {
        const response = await request(app)
            .post("/api/v1/auth/registro")
            .send({
                nombres: "Samuel",
                apellidos: "Moreno",
                tipo_documento_id: 2,
                numero_documento: "1234567098",
                fecha_nacimiento: "2007-06-15",
                correo_electronico: "samuel@gmail.com",
                password: "Samuel123@",
                rol: 3
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});

// email inválido
describe("POST /auth/registro", () => {
    it("Deberia rechazar la solocitud, por correo invalido", async () => {
        const response = await request(app)
            .post("/api/v1/auth/registro")
            .send({
                nombres: "Samuel",
                apellidos: "Moreno",
                tipo_documento_id: 2,
                numero_documento: "1234567098",
                fecha_nacimiento: "2007-06-15",
                correo_electronico: "gmail.com",
                password: "Samuel123@",
                rol: 3
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});

// password inválido
describe("POST /auth/registro", () => {
    it("Deberia rechazar la solocitud, por una contraseña no correcta", async () => {
        const response = await request(app)
            .post("/api/v1/auth/registro")
            .send({
                nombres: "Samuel",
                apellidos: "Moreno",
                tipo_documento: 2,
                numero_documento_id: "1234567098",
                fecha_nacimiento: "2007-06-15",
                correo_electronico: "admin@gmail.com",
                password: "12345",
                rol: 3
            });            

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});

// campos faltantes
describe("POST /auth/registro", () => {
    it("Deberia rechazar la solocitud, por campos vacios", async () => {
        const response = await request(app)
            .post("/api/v1/auth/registro")
            .send({});

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});
