import { Router } from "express";
import { RoleController } from "./role.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", verifyToken, requireAdmin, RoleController.getRoles);
router.post("/", verifyToken, requireAdmin, RoleController.createRole);

export default router;
