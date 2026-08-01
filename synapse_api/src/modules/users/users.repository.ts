
import { prisma } from "../../config/prisma";

export class UsersRepository {

    static async findAll() {
        try {
            return prisma.usuarios.findMany();
        } catch (error: any) {
            console.log("Error finding all users:", error);
            throw error.response || error.message;
        }
    }

    static async findById(id: number) {
        try {
            return prisma.usuarios.findUnique({
                where: {
                    id
                }
            });
        } catch (error: any) {
            console.log("Error finding user by id:", error);
            throw error.response || error.message;
        }
    }

    static async findByEmail(email: string) {
        try {
            return prisma.usuarios.findUnique({
                where: {
                    correo_electronico: email
                }
            });
        } catch (error: any) {
            console.log("Error finding user by email:", error);
            throw error.response || error.message;
        }
    }
    
    static async create(data: any) {
        try {
            return prisma.usuarios.create({
                data
            });
        } catch (error: any) {
            console.log("Error creating user:", error);
            throw error.response || error.message;
        }
    }
    
    static async update(id: number, data: any) {
        try {
            return prisma.usuarios.update({
                where: {
                    id
                },
                data
            });
        } catch (error: any) {
            console.log("Error updating user:", error);
            throw error.response || error.message;
        }
    }
    
    static async delete(id: number) {
        try {
            return prisma.usuarios.delete({
                where: {
                    id
                }
            });
        } catch (error: any) {
            console.log("Error deleting user:", error);
            throw error.response || error.message;
        }
    }
}
