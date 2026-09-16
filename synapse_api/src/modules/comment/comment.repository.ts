import { prisma } from "../../config/prisma";

export class CommentRepository {
  static async findByContentId(contentId: string) {
    return await prisma.comment.findMany({
      where: {
        contentId: String(contentId),
        deleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  static async findById(id: string) {
    return await prisma.comment.findUnique({
      where: { id: String(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  static async create(data: { content: string; contentId: string; authorId: string; parentId?: string | null }) {
    return await prisma.comment.create({
      data: {
        content: data.content,
        contentId: data.contentId,
        authorId: data.authorId,
        parentId: data.parentId ?? undefined,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  static async delete(id: string) {
    return await prisma.comment.delete({
      where: { id: String(id) },
    });
  }
}
