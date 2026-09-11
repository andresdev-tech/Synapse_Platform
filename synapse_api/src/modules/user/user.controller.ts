import { Response } from "express";
import { ZodError } from "zod";
import { UserService } from "./user.service";
import { updateLayoutSchema } from "./user.schema";
import { AuthRequest } from "../../middleware/auth.middleware";

export class UserController {
  static async getUsers(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  }

  static async getLayout(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    try {
      const userLayout = await UserService.getUserLayout(userId);
      res.json(userLayout);
    } catch (error) {
      console.error("Error al obtener preferencias:", error);
      res.status(500).json({ error: "Error al obtener preferencias" });
    }
  }

  static async updateLayout(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    try {
      const parsedData = updateLayoutSchema.parse(req.body);
      const user = await UserService.updateUserLayout(userId, parsedData);
      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "Datos inválidos" });
        return;
      }
      console.error("Error al actualizar preferencias:", error);
      res.status(500).json({ error: "Error al actualizar preferencias" });
    }
  }
}

// Backward compatibility exports
export const getUsers = UserController.getUsers;
export const getLayout = UserController.getLayout;
export const updateLayout = UserController.updateLayout;
