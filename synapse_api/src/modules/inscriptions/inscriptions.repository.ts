import { prisma } from "../../config/prisma";

export class InscriptionsRepository {

    static async getInscriptions() {
        try {

            return await prisma.inscripcion.findMany({
                include: {
                    usuario: true,
                    programa: true
                }
            });

        } catch (error: any) {

            console.log(
                "Error finding inscriptions:",
                error
            );

            throw error.response || error.message;
        }
    }

    static async getByPrograma(programa_id: number) {
        try {

            return await prisma.inscripcion.findMany({
                where: {
                    programa_id,
                },
                include: {
                    usuario: true,
                    programa: true,
                },
                orderBy: {
                    creado_en: "desc",
                }
            });

        } catch (error: any) {

            console.log(
                "Error finding inscriptions by program:",
                error
            );

            throw error.response || error.message;
        }
    }

    static async getByUsers(usuario_id: number) {
        try {

            return await prisma.inscripcion.findMany({
                where: {
                    usuario_id,
                },
                include: {
                    programa: true,
                },
                orderBy: {
                    creado_en: "desc",
                }
            });

        } catch (error: any) {

            console.log(
                "Error finding user inscriptions:",
                error
            );

            throw error.response || error.message;
        }
    }

    static async searchByUserAndProgram(
        usuario_id: number,
        programa_id: number
    ) {
        try {

            return await prisma.inscripcion.findFirst({
                where: {
                    usuario_id,
                    programa_id,
                },
            });

        } catch (error: any) {

            console.log(
                "Error searching inscription by user and program:",
                error
            );

            throw error.response || error.message;
        }
    }

    static async getById(id: number) {
        try {

            return await prisma.inscripcion.findUnique({
                where: {
                    id,
                },
                include: {
                    usuario: true,
                    programa: true,
                },
            });

        } catch (error: any) {

            console.log(
                "Error finding inscription:",
                error
            );

            throw error.response || error.message;
        }
    }

    static async create(
        usuario_id: number,
        programa_id: number
    ) {
        try {

            return await prisma.inscripcion.create({
                data: {
                    usuario_id,
                    programa_id,
                    estado: "pendiente",
                },
                include: {
                    programa: true,
                },
            });

        } catch (error: any) {

            console.log(
                "Error creating inscription:",
                error
            );

            throw error.response || error.message;
        }
    }

    static async changeStatus(
        id: number,
        estado: string
    ) {
        try {

            return await prisma.inscripcion.update({
                where: {
                    id,
                },
                data: {
                    estado,
                },
            });

        } catch (error: any) {

            console.log(
                "Error changing inscription status:",
                error
            );

            throw error.response || error.message;
        }
    }

    static async delete(id: number) {
        try {

            return await prisma.inscripcion.delete({
                where: {
                    id,
                },
            });

        } catch (error: any) {

            console.log(
                "Error deleting inscription:",
                error
            );

            throw error.response || error.message;
        }
    }
}