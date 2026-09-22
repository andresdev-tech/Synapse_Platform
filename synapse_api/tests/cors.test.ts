import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("CORS Security & Policy Tests", () => {
  it("debe permitir el origen de producción principal https://synapseplatform.app", async () => {
    const res = await request(app)
      .options("/api/notes")
      .set("Origin", "https://synapseplatform.app")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBe("https://synapseplatform.app");
  });

  it("debe permitir el origen local de desarrollo http://localhost:3000", async () => {
    const res = await request(app)
      .options("/api/notes")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("debe permitir el origen local http://127.0.0.1:3000", async () => {
    const res = await request(app)
      .options("/api/notes")
      .set("Origin", "http://127.0.0.1:3000")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:3000");
  });

  it("NO debe devolver cabecera Access-Control-Allow-Origin para orígenes no autorizados", async () => {
    const res = await request(app)
      .options("/api/notes")
      .set("Origin", "https://malicious-site.com")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("debe permitir peticiones sin cabecera Origin (llamadas SSR, Swagger, Proxy, etc.)", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).not.toBe(500);
  });

  it("debe incluir todos los métodos permitidos requeridos", async () => {
    const res = await request(app)
      .options("/api/notes")
      .set("Origin", "https://synapseplatform.app")
      .set("Access-Control-Request-Method", "PATCH");

    expect(res.headers["access-control-allow-methods"]).toContain("PATCH");
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
    expect(res.headers["access-control-allow-methods"]).toContain("PUT");
    expect(res.headers["access-control-allow-methods"]).toContain("DELETE");
  });
});
