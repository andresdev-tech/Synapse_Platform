import request from 'supertest';
import { describe, it, expect } from 'vitest'
import app from '../../src/app'

// inicio de sesion exitoso 200 ok
describe("POST /auth/login", () => {
    it("Deberia iniciar sesion correctamente", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                correo_electronico: "andresjll40@gmail.com",
                password: "Andres123@"
            });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("usuario");
    });
});

// Inicio de sesion con correo no registrado deveria devolver 404 Not Found
describe("POST /auth/login", () => {
    it("Deberia rechazar la solicitud, ya que no esta registrado el usuario", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                correo_electronico: "alex@gmail.com",
                password: "Alex12@"
            });
            
        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});

// Respuesta a campos vacios
describe("POST /auth/login", () => {
    it("Deberia Rechazar la solicito, ya que se le envian datos vacios", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({});
            
        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});

// Email inavido
describe("POST /auth/login", () => {
    it("Deberia rechazar la solicitud, ya que no es email valido", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                correo_electronico: "andresjll40gmail.com",
                password: "andres1@"
            });
            
        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});

// Password incorrecto
describe("POST /auth/login", () => {
    it("Deberia rechazar la solicitud, ya que la contraseña no es correcta", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                correo_electronico: "andresjll40@gmail.com",
                password: "1234567"
            });
            
        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("ok");
        expect(response.body).toHaveProperty("error");
    });
});