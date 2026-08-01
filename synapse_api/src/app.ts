import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import router from "./routes/index";
import { swaggerUi, swaggerSpec } from "./docs/swager";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));
app.use(cors(
    {
        origin: "*",
    }
));
app.use(express.json());
app.use(morgan("combined"));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/", router);

console.log('qwenkey: ', process.env.QWEN_API_KEY);

export default app;

//waggerUi.serve, swaggerUi.setup(swaggerSpec)