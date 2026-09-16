import { Router } from "express";
import { AuditLogController } from "./audit-log.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", verifyToken, requireAdmin, AuditLogController.getLogs);

export default router;
