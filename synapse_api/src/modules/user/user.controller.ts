import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";



export const updateLayout = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  const { layoutPrefs } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { layoutPrefs: JSON.stringify(layoutPrefs) },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar preferencias" });
  }
};

export const getLayout = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { layoutPrefs: true }
    });
    res.json(user || { layoutPrefs: null });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener preferencias" });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}
