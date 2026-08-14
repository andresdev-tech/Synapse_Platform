import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import usersRoutes from "../modules/users/users.routes";
import programsRoutes from "../modules/programas/programs.routes";
import chatRoutes from "../modules/chatbot/chatbot.routes";
import inscriptionsRoutes from "../modules/inscriptions/inscriptions.routes";
import gruposRoutes from "../modules/grupos/grupos.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usersRoutes);
router.use("/programas", programsRoutes);
router.use("/chat", chatRoutes);
router.use("/inscripciones", inscriptionsRoutes);
router.use("/grupos", gruposRoutes);

export default router;