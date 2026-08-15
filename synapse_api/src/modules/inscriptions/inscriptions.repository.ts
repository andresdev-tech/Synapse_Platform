import { prisma } from "../../config/prisma";

export class InscriptionsRepository {

    static async getInscriptions() {
        try {

            return await prisma.inscripciones.findMany({
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

    static async getByPrograma(programa_id: string) {
        try {

            return await prisma.inscripciones.findMany({
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

    static async getByUsers(usuario_id: string) {
        try {

            return await prisma.inscripciones.findMany({
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
        usuario_id: string,
        programa_id: string
    ) {
        try {

            return await prisma.inscripciones.findFirst({
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

    static async getById(id: string) {
        try {

            return await prisma.inscripciones.findUnique({
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
        usuario_id: string,
        programa_id: string
    ) {
        try {

            return await prisma.inscripciones.create({
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
        id: string,
        estado: string
    ) {
        try {

            return await prisma.inscripciones.update({
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

    static async delete(id: string) {
        try {

            return await prisma.inscripciones.delete({
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