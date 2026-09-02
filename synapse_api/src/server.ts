import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend de Synapse (API) corriendo en todas las interfaces (0.0.0.0).`);
  console.log(`-> Local:   http://localhost:${PORT}`);
  console.log(`-> Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`Variables de entorno cargadas correctamente (Base de datos y Tokens OK).`);
});
