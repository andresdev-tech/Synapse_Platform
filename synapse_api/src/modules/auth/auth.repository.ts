import { prisma } from "../../config/prisma";

/**
 * Repositorio de base de datos para autenticación y usuarios.
 * Gestiona consultas y operaciones directas en las tablas de usuarios, roles y códigos de verificación.
 */
export class AuthRepository {
  /**
   * Busca un usuario por su correo electrónico e incluye los datos de su rol.
   */
  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email }, include: { role: { select: { name: true } } } })
  }

  /**
   * Busca un rol en la base de datos por su nombre (ej: USER, ADMIN).
   */
  static async findRoleByName(name: string) {
    return await prisma.role.findUnique({ where: { name: name as any } })
  }

  /**
   * Crea un nuevo rol en el sistema.
   */
  static async createRole(name: string) {
    return await prisma.role.create({ data: { name: name as any, updatedAt: new Date() } })
  }

  /**
   * Crea un nuevo usuario en la base de datos con los datos proporcionados.
   */
  static async createUser(data: any) {
    return await prisma.user.create({ data: { ...data, updatedAt: new Date() } })
  }

  /**
   * Guarda un código de verificación temporal asociado a un correo con su fecha de vencimiento.
   */
  static async createVerificationCode(email: string, code: string, expiresAt: Date) {
    return await prisma.verificationCode.create({
      data: { email, code, expiresAt }
    })
  }

  /**
   * Busca un código de verificación que coincida con el correo y no haya expirado aún.
   */
  static async findVerificationCode(email: string, code: string) {
    return await prisma.verificationCode.findFirst({
      where: { email, code, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    })
  }

  /**
   * Actualiza la fecha de verificación de correo del usuario, marcándolo como verificado.
   */
  static async updateUserEmailVerified(email: string) {
    return await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    })
  }

  /**
   * Elimina todos los códigos de verificación vinculados a un correo electrónico.
   */
  static async deleteVerificationCodes(email: string) {
    return await prisma.verificationCode.deleteMany({
      where: { email }
    })
  }

  /**
   * Elimina los códigos de verificación antiguos de un correo, conservando únicamente el más reciente.
   */
  static async deleteVerificationCodesExceptLatest(email: string) {
    const latest = await prisma.verificationCode.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!latest) return;

    await prisma.verificationCode.deleteMany({
      where: { email, id: { not: latest.id } },
    });
  }

  /**
   * Busca un usuario que posea rol de ADMIN o SUPER_ADMIN por su correo electrónico.
   */
  static async findAdminByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
        role: {
          name: {
            in: ["ADMIN", "SUPER_ADMIN"]
          }
        }
      }
    })
  }

  /**
   * Crea directamente un usuario con rol de Administrador en la base de datos.
   */
  static async createadmin(datas: any) {
    return await prisma.user.create({
      data: {
        name: datas.name,
        email: datas.email,
        emailVerified: new Date(),
        image: null,
        status: datas.state,
        role: {connect: {name: 'ADMIN'}},
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
  }
}

