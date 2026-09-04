import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (e) {
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};
