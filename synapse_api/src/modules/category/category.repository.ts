import { prisma } from "../../config/prisma";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.types";

export class CategoryRepository {
  static async findAll() {
    return await prisma.category.findMany({
      include: {
        Category: {
          select: { name: true },
        },
        _count: {
          select: { Content: true },
        },
      },
    });
  }

  static async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id: String(id) },
      include: {
        Category: {
          select: { name: true },
        },
        other_Category: {
          select: { name: true, id: true },
        },
        Content: {
          select: { title: true, id: true },
        },
      },
    });

    if (!category) return null;

    return {
      ...category,
      children: category.other_Category,
      contents: category.Content,
    };
  }

  static async findBySlug(slug: string) {
    return await prisma.category.findUnique({
      where: { slug },
    });
  }

  static async create(data: CreateCategoryDTO & { slug: string }) {
    return await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        color: data.color,
        parentId: data.parentId ?? undefined,
        updatedAt: new Date(),
      },
    });
  }

  static async update(id: string, data: UpdateCategoryDTO & { slug?: string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;

    return await prisma.category.update({
      where: { id: String(id) },
      data: updateData,
    });
  }

  static async delete(id: string) {
    return await prisma.category.delete({
      where: { id: String(id) },
    });
  }
}
