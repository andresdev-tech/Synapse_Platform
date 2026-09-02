import { prisma } from "../../config/prisma";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email }, include: { role: true } })
  }

  static async findRoleByName(name: string) {
    return await prisma.role.findUnique({ where: { name } })
  }

  static async createRole(name: string) {
    return await prisma.role.create({ data: { name } })
  }

  static async createUser(data: any) {
    return await prisma.user.create({ data })
  }

  static async createVerificationCode(email: string, code: string, expiresAt: Date) {
    return await prisma.verificationCode.create({
      data: { email, code, expiresAt }
    })
  }

  static async createPasswordResetCode(email: string, code: string, expiresAt: Date) {
    return await prisma.passwordReset.create({
      data: { email, code, expiresAt }
    })
  }

  static async findValidPasswordResetCode(email: string, code: string) {
    return await prisma.passwordReset.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async updateUserPassword(email: string, hashedPassword: string) {
    return await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
  }

  static async deletePasswordResetCodes(email: string) {
    return await prisma.passwordReset.deleteMany({
      where: { email }
    })
  }

  static async findVerificationCode(email: string, code: string) {
    return await prisma.verificationCode.findFirst({
      where: { email, code, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    })
  }

  static async updateUserEmailVerified(email: string) {
    return await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    })
  }

  static async deleteVerificationCodes(email: string) {
    return await prisma.verificationCode.deleteMany({
      where: { email }
    })
  }
}
