import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import usersRoutes from "../modules/users/users.routes";
import programsRoutes from "../modules/programas/programs.routes";
import chatRoutes from "../modules/chatbot/chatbot.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usersRoutes);
router.use("/programas", programsRoutes);
router.use("/chat", chatRoutes);

export default router;