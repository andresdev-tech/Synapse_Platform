import { prisma } from "../../config/prisma";

export interface CreateSessionDTO {
  sessionToken: string;
  userId: string;
  expires: Date;
}

export class SessionRepository {
  static async createSession(data: CreateSessionDTO) {
    return await prisma.session.create({
      data: {
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      },
    });
  }

  static async findSessionByToken(sessionToken: string) {
    return await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            role: true,
          },
        },
      },
    });
  }

  static async deleteSession(sessionToken: string) {
    return await prisma.session.delete({
      where: { sessionToken },
    });
  }

  static async deleteUserSessions(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    });
  }
}
