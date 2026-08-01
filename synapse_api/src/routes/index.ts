import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import usersRoutes from "../modules/users/users.routes";
import programsRoutes from "../modules/programas/programs.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usersRoutes);
router.use("/programs", programsRoutes);

export default router;