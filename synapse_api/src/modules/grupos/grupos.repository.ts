import { prisma } from "../../config/prisma"

export class GruposRepository {
    static async getGroupsByProgram(programId: number) {
        return prisma.grupos.findMany({
            where: {
                programa_id: programId,
            },
            include: {
                programas: true,
            }
        });
    }

    static async getGroupMembers(groupId: number) {
        return prisma.inscripciones.findMany({
            where: {
                grupo_id: groupId,
            },
            include: {
                usuarios_inscripciones_usuario_idTousuarios: true,
                programas: true,
                grupos: true
            },
        });
    }

    static async getCompleteGroupInfo(groupId: number) {
        return prisma.grupos.findUnique({
            where: {
                id: groupId,
            },
            include: {
                programa: true,
                inscripciones: {
                    include: {
                        usuarios_inscripciones_usuario_idTousuarios: true,
                    },
                },
            },
        });
    }

    static async getPendingInscriptions(programId: number) {
        return prisma.inscripciones.findMany({
            where: {
                programa_id: programId,
                grupo_id: null
            },
            include: {
                usuarios_inscripciones_usuario_idTousuarios: true,
                programas: true
            }
        })
    }

    static async getGroupLearners(groupId: number) {
        return prisma.inscripciones.findMany({
            where: {
                grupo_id: groupId,
            },
            include: {
                usuarios_inscripciones_usuario_idTousuarios: true,
            },
        });
    }

    static async getProgramStatistics(programId: number) {
        const [
            totalInscriptions,
            assignedInscriptions,
            pendingInscriptions,
            groups,
        ] = await Promise.all([
            prisma.inscripciones.count({
                where: {
                    programa_id: programId,
                },
            }),
            prisma.inscripciones.count({
                where: {
                    programa_id: programId,
                    grupo_id: {
                        not: null,
                    },
                },
            }),
            prisma.inscripciones.count({
                where: {
                    programa_id: programId,
                    grupo_id: null
                },
            }),
            prisma.grupos.count({
                where: {
                    programa_id: programId
                },
            }),
        ]);
        return {
            totalInscriptions,
            assignedInscriptions,
            pendingInscriptions,
            groups,
        }

    }

    static async findInscriptionById(inscriptionId: number) {
        return prisma.inscripciones.findUnique({
            where: {
                id: inscriptionId,
            },
            include: {
                usuarios_inscripciones_usuario_idTousuarios: true,
                programas: true,
                grupos: true,
            },
        });
    }

    static async findGroupById(groupId: number) {
        return prisma.grupos.findUnique({
            where: {
                id: groupId,
            },
            include: {
                programas: true,
            },
        });
    }

    static async findInscriptionByUserAndProgram(
        userId: number,
        programId: number
    ) {
        return prisma.inscripciones.findFirst({
            where:{
                usuario_id: userId,
                programa_id: programId,
            },
            include:{
                grupos: true,
                programas: true,
                usuarios_inscripciones_usuario_idTousuarios: true,
            },
        });
    }

    static async assignLearner(
        inscriptionId: number,
        groupId: number
    ) {
        return prisma.inscripciones.update({
            where: {
                id: inscriptionId,
            },
            data: {
                grupo_id: groupId,
            },
            include: {
                usuarios_inscripciones_usuario_idTousuarios: true,
                programas: true,
                grupos: true,
            },
        });
    }

    static async changeLearnerGroup(
        inscriptionId: number,
        groupId: number
    ) {
        return prisma.inscripciones.update({
            where: {
                id: inscriptionId,
            },
            data: {
                grupo_id: groupId,
            },
            include: {
                usuarios_inscripciones_usuario_idTousuarios: true,
                programas: true,
                grupos: true,
            },
        });
    }

    static async removeLearner(
        inscriptionId: number
    ) {
        return prisma.inscripciones.update({
            where: {
                id: inscriptionId,
            },
            data: {
                grupo_id: null,
            },
            include: {
                usuarios_inscripciones_usuario_idTousuarios: true,
                programas: true,
                grupos: true,
            },
        });
    }
}