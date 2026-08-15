import { prisma } from "../../config/prisma"

export class GruposRepository {
    static async getGroupsByProgram(programId: string) {
        return prisma.grupos.findMany({
            where: {
                programa_id: programId,
            },
            include: {
                programa: true,
            }
        });
    }

    static async getGroupMembers(groupId: string) {
        return prisma.inscripciones.findMany({
            where: {
                grupo_id: groupId,
            },
            include: {
                usuario: true,
                programas: true,
                grupos: true
            },
        });
    }

    static async getCompleteGroupInfo(groupId: string) {
        return prisma.grupos.findUnique({
            where: {
                id: groupId,
            },
            include: {
                programa: true,
                inscripciones: {
                    include: {
                        usuario: true,
                    },
                },
            },
        });
    }

    static async getPendingInscriptions(programId: string) {
        return prisma.inscripciones.findMany({
            where: {
                programa_id: programId,
                grupo_id: null
            },
            include: {
                usuario: true,
                programa: true
            }
        })
    }

    static async getGroupLearners(groupId: string) {
        return prisma.inscripciones.findMany({
            where: {
                grupo_id: groupId,
            },
            include: {
                usuario: true,
            },
        });
    }

    static async getProgramStatistics(programId: string) {
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

    static async findInscriptionById(inscriptionId: string) {
        return prisma.inscripciones.findUnique({
            where: {
                id: inscriptionId,
            },
            include: {
                usuario: true,
                programa: true,
                grupo: true,
            },
        });
    }

    static async findGroupById(groupId: string) {
        return prisma.grupos.findUnique({
            where: {
                id: groupId,
            },
            include: {
                programa: true,
            },
        });
    }

    static async findInscriptionByUserAndProgram(
        userId: string,
        programId: string
    ) {
        return prisma.inscripciones.findFirst({
            where:{
                usuario_id: userId,
                programa_id: programId,
            },
            include:{
                grupo: true,
                programa: true,
                usuario: true,
            },
        });
    }

    static async assignLearner(
        inscriptionId: string,
        groupId: string
    ) {
        return prisma.inscripciones.update({
            where: {
                id: inscriptionId,
            },
            data: {
                grupo_id: groupId,
            },
            include: {
                usuario: true,
                programa: true,
                grupo: true,
            },
        });
    }

    static async changeLearnerGroup(
        inscriptionId: string,
        groupId: string
    ) {
        return prisma.inscripciones.update({
            where: {
                id: inscriptionId,
            },
            data: {
                grupo_id: groupId,
            },
            include: {
                usuario: true,
                programa: true,
                grupo: true,
            },
        });
    }

    static async removeLearner(
        inscriptionId: string
    ) {
        return prisma.inscripciones.update({
            where: {
                id: inscriptionId,
            },
            data: {
                grupo_id: null,
            },
            include: {
                usuario: true,
                programa: true,
                grupo: true,
            },
        });
    }
}