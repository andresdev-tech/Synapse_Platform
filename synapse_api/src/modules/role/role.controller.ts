import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { RoleService } from "./role.service";

export class RoleController {
  static async getRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roles = await RoleService.getRoles();
      res.status(200).json({ success: true, data: roles });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al obtener roles" });
    }
  }

  static async createRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name) {
        res.status(400).json({ success: false, error: "El nombre del rol es obligatorio" });
        return;
      }

      const role = await RoleService.createRole(
        { name, description },
        req.user?.id
      );

      res.status(201).json({ success: true, data: role });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Error al crear rol" });
    }
  }
}
