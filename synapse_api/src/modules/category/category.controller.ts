import { Request, Response } from "express";
import { ZodError } from "zod";
import { CategoryService } from "./category.service";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

/**
 * Controlador para la administración de categorías del sistema.
 * Permite crear, listar, consultar, actualizar y eliminar categorías de contenidos.
 */
export class CategoryController {
  /**
   * Crea una nueva categoría en el sistema tras validar los datos enviados.
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = createCategorySchema.parse(req.body);
      const category = await CategoryService.createCategory(parsedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "Datos inválidos" });
        return;
      }
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Error al crear categoría" });
    }
  }

  /**
   * Obtiene la lista completa de todas las categorías registradas.
   */
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  }

  /**
   * Obtiene la información detallada de una categoría por su identificador.
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const category = await CategoryService.getCategoryById(id as string);
      if (!category) {
        res.status(404).json({ error: "Categoría no encontrada" });
        return;
      }
      res.json(category);
    } catch (error) {
      console.error("Error getting category by id:", error);
      res.status(500).json({ error: "Error al obtener categoría" });
    }
  }

  /**
   * Actualiza los datos de una categoría existente según su ID.
   */
  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const parsedData = updateCategorySchema.parse(req.body);
      const category = await CategoryService.updateCategory(id as string, parsedData);
      res.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "Datos inválidos" });
        return;
      }
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Error al actualizar categoría" });
    }
  }

  /**
   * Elimina una categoría del sistema según su ID.
   */
  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await CategoryService.deleteCategory(id as string);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Error al eliminar categoría" });
    }
  }
}

// Exportaciones para compatibilidad
export const createCategory = CategoryController.create;
export const getCategories = CategoryController.getAll;
export const getCategoryById = CategoryController.getById;
export const updateCategory = CategoryController.update;
export const deleteCategory = CategoryController.delete;

