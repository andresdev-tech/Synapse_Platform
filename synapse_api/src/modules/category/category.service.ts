import { CategoryRepository } from "./category.repository";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.types";

/**
 * Servicio de lógica de negocio para la gestión de categorías.
 */
export class CategoryService {
  /**
   * Genera un identificador amigable (slug) a partir del nombre de la categoría (ej: "Bases de Datos" -> "bases-de-datos").
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, "");
  }

  /**
   * Obtiene la lista de todas las categorías disponibles.
   */
  static async getAllCategories() {
    return await CategoryRepository.findAll();
  }

  /**
   * Obtiene una categoría específica mediante su identificador.
   */
  static async getCategoryById(id: string) {
    return await CategoryRepository.findById(id);
  }

  /**
   * Genera el slug y registra una nueva categoría en la base de datos.
   */
  static async createCategory(data: CreateCategoryDTO) {
    const slug = this.generateSlug(data.name);
    return await CategoryRepository.create({
      ...data,
      slug,
    });
  }

  /**
   * Actualiza los datos de una categoría, regenerando el slug si el nombre fue modificado.
   */
  static async updateCategory(id: string, data: UpdateCategoryDTO) {
    const slug = data.name ? this.generateSlug(data.name) : undefined;
    return await CategoryRepository.update(id, {
      ...data,
      slug,
    });
  }

  /**
   * Elimina una categoría por su identificador.
   */
  static async deleteCategory(id: string) {
    return await CategoryRepository.delete(id);
  }
}

