import { CategoryRepository } from "./category.repository";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.types";

export class CategoryService {
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, "");
  }

  static async getAllCategories() {
    return await CategoryRepository.findAll();
  }

  static async getCategoryById(id: string) {
    return await CategoryRepository.findById(id);
  }

  static async createCategory(data: CreateCategoryDTO) {
    const slug = this.generateSlug(data.name);
    return await CategoryRepository.create({
      ...data,
      slug,
    });
  }

  static async updateCategory(id: string, data: UpdateCategoryDTO) {
    const slug = data.name ? this.generateSlug(data.name) : undefined;
    return await CategoryRepository.update(id, {
      ...data,
      slug,
    });
  }

  static async deleteCategory(id: string) {
    return await CategoryRepository.delete(id);
  }
}
