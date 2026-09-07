import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, color, parentId } = req.body;
    
    // Generar slug automáticamente desde el nombre
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        color,
        parentId,
        updatedAt: new Date()
      }
    });
    res.status(201).json(category);
  } catch (e) {
    console.error("Error creating category:", e);
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        Category: {
          select: { name: true }
        },
        _count: {
          select: { Content: true }
        }
      }
    });
    res.json(categories);
  } catch (e) {
    console.error("Error getting categories:", e);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: String(id) },
      include: {
        Category: {
          select: { name: true }
        },
        children: {
          select: { name: true, id: true }
        },
        contents: {
          select: { title: true, id: true }
        }
      }
    });
    
    if (!category) {
      res.status(404).json({ error: "Categoría no encontrada" });
      return;
    }
    
    res.json(category);
  } catch (e) {
    console.error("Error getting category by id:", e);
    res.status(500).json({ error: "Error al obtener categoría" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { name, description, imageUrl, color, parentId } = req.body;
    
    let slug;
    if (name) {
      slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (color !== undefined) updateData.color = color;
    if (parentId !== undefined) updateData.parentId = parentId;
    
    const category = await prisma.category.update({
      where: { id: String(id) },
      data: updateData
    });
    res.json(category);
  } catch (e) {
    console.error("Error updating category:", e);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (e) {
    console.error("Error deleting category:", e);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};
