import "dotenv/config"

import app from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend de Synapse (API) corriendo en todas las interfaces (0.0.0.0).`);
  console.log(`-> Local:   http://localhost:${PORT}`);
  console.log(`-> Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`Variables de entorno cargadas correctamente (Base de datos y Tokens OK).`);
  console.log(`-> QWEN_API_KEY: ${process.env.QWEN_API_KEY ? "Cargada" : "No cargada"}`);
  console.log(`-> QWEN_BASE_URL: ${process.env.QWEN_BASE_URL || "No configurada (se usará la URL por defecto)"}`);
  console.log(`-> QWEN_MODEL: ${process.env.QWEN_MODEL || "No configurado (se usará el modelo por defecto)"}`);
  console.log(`-> QWEN_EMBEDDING_MODEL: ${process.env.QWEN_EMBEDDING_MODEL || "No configurado (se usará el modelo por defecto)"}`);
  console.log("Logs de prueba: ", process.env.QWEN_API_KEY, process.env.QWEN_BASE_URL, process.env.QWEN_MODEL);
});
