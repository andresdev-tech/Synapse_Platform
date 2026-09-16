import { UserRepository } from "./user.repository";
import { UpdateLayoutDTO } from "./user.types";

export class UserService {
  static async getAllUsers() {
    return await UserRepository.findAll();
  }

  static async getUserLayout(userId: string) {
    const user = await UserRepository.findLayoutById(userId);
    return user || { layoutPrefs: null };
  }

  static async updateUserLayout(userId: string, data: UpdateLayoutDTO) {
    return await UserRepository.updateLayout(userId, data.layoutPrefs);
  }
}
