import { describe, it, expect } from "vitest";
import { swaggerSpec } from "../src/swagger/swagger.config";

describe("Swagger Documentation Tests", () => {
  it("debería compilar y generar la especificación OpenAPI con todos los paths", () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.openapi).toBe("3.0.0");
    expect(swaggerSpec.info.title).toContain("Synapse");

    const paths = Object.keys(swaggerSpec.paths || {});
    expect(paths.length).toBeGreaterThan(10);

    // Verificar que los endpoints clave existen en la documentación
    expect(paths).toContain("/api/auth/register");
    expect(paths).toContain("/api/auth/login");
    expect(paths).toContain("/api/auth/otp/request");
    expect(paths).toContain("/api/auth/otp/verify");
    expect(paths).toContain("/api/notes");
    expect(paths).toContain("/api/categories");
    expect(paths).toContain("/api/comments");
    expect(paths).toContain("/api/chatbot");
    expect(paths).toContain("/api/rag/resources");
    expect(paths).toContain("/api/upload");
    expect(paths).toContain("/api/audit-logs");
    expect(paths).toContain("/api/roles");
  });
});
