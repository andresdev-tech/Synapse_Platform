import { UserRepository } from "./user.repository";
import { UpdateLayoutDTO } from "./user.types";

/**
 * Servicio para la lógica de negocio relacionada con los usuarios y su personalización.
 */
export class UserService {
  /**
   * Obtiene todos los usuarios registrados a través del repositorio.
   */
  static async getAllUsers() {
    return await UserRepository.findAll();
  }

  /**
   * Obtiene las preferencias de interfaz de un usuario específico o retorna un objeto vacío por defecto.
   */
  static async getUserLayout(userId: string) {
    const user = await UserRepository.findLayoutById(userId);
    return user || { layoutPrefs: null };
  }

  /**
   * Actualiza las preferencias de interfaz del usuario en la base de datos.
   */
  static async updateUserLayout(userId: string, data: UpdateLayoutDTO) {
    return await UserRepository.updateLayout(userId, data.layoutPrefs);
  }
}

