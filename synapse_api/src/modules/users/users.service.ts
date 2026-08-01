
import { UsersRepository } from "./users.repository";

export class UsersService {
    
    static async getProfile(id: number) {
        try {
            const user = await UsersRepository.findById(id);

            console.log("user id:", id);
            console.log("user:", user);

            if (!user) {
                throw new Error("User not found");
            }
            
            return user;
        } catch (error: any) {
            throw error.response || error.message;
        }
    }
    
    static async getAll() {
        return UsersRepository.findAll();
    }
    
    static async create(data: any) {
        return UsersRepository.create(data);
    }
    
    static async update(id: number, data: any) {
        return UsersRepository.update(id, data);
    }
    
    static async delete(id: number) {
        return UsersRepository.delete(id);
    }
    
    static async findByEmail(email: string) {
        return UsersRepository.findByEmail(email);
    }

    static async getById(id: number) {
        return UsersRepository.findById(id);
    }
}
