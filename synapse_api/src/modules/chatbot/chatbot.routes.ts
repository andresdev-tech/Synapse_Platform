import { Router } from "express";

import { ChatbotController } from "./chatbot.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  verifyToken,
  ChatbotController.chat
);

export default router;