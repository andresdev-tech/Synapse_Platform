import { GruposRepository } from "./grupos.repository";
import {
    AssignLearnerInput,
    ChangeGroupInput,
    ReasonInput,
} from "./grupos.schema";

export class GroupsService {

    static async getGroupsByProgram(programId: string) {
        const groups = await GruposRepository.getGroupsByProgram(programId);

        return groups;
    }

    static async getGroupMembers(groupId: string) {
        const group = await GruposRepository.findGroupById(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        return GruposRepository.getGroupMembers(groupId);
    }

    static async getCompleteGroupInfo(groupId: string) {
        const group =
            await GruposRepository.getCompleteGroupInfo(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        return group;
    }

    static async getPendingInscriptions(programId: string) {
        return GruposRepository.getPendingInscriptions(programId);
    }

    static async getGroupLearners(groupId: string) {
        const group = await GruposRepository.findGroupById(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        return GruposRepository.getGroupLearners(groupId);
    }

    static async getProgramStatistics(programId: string) {
        return GruposRepository.getProgramStatistics(programId);
    }

    static async assignLearner(data: AssignLearnerInput) {
        const { inscriptionId, groupId } = data;

        const inscription =
            await GruposRepository.findInscriptionById(inscriptionId);

        if (!inscription) {
            throw new Error("La inscripción no existe");
        }

        const group =
            await GruposRepository.findGroupById(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        if (inscription.programa_id !== group.programa_id) {
            throw new Error(
                "El aprendiz y el grupo no pertenecen al mismo programa"
            );
        }

        if (inscription.grupo_id) {
            throw new Error(
                "El aprendiz ya pertenece a un grupo"
            );
        }

        return GruposRepository.assignLearner(
            inscriptionId,
            groupId
        );
    }

    static async changeLearnerGroup(data: ChangeGroupInput) {
        const {
            userId,
            programId,
            newGroupId,
        } = data;

        const inscription =
            await GruposRepository.findInscriptionByUserAndProgram(
                userId,
                programId
            );

        if (!inscription) {
            throw new Error(
                "El aprendiz no tiene una inscripción en este programa"
            );
        }

        const group =
            await GruposRepository.findGroupById(newGroupId);

        if (!group) {
            throw new Error("El nuevo grupo no existe");
        }

        if (group.programa_id !== programId) {
            throw new Error(
                "El grupo no pertenece al programa indicado"
            );
        }

        if (inscription.grupo_id === newGroupId) {
            throw new Error(
                "El aprendiz ya pertenece a este grupo"
            );
        }

        return GruposRepository.changeLearnerGroup(
            inscription.id,
            newGroupId
        );
    }

    static async removeLearner(
        groupId: string,
        userId: string
    ) {
        const group =
            await GruposRepository.findGroupById(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        const inscription =
            await GruposRepository.findInscriptionByUserAndProgram(
                userId,
                group.programa_id
            );

        if (!inscription) {
            throw new Error(
                "El aprendiz no tiene una inscripción en este programa"
            );
        }

        if (inscription.grupo_id !== groupId) {
            throw new Error(
                "El aprendiz no pertenece a este grupo"
            );
        }

        return GruposRepository.removeLearner(inscription.id);
    }

    static async expelLearner(
        groupId: string,
        userId: string,
        data: ReasonInput
    ) {
        const group =
            await GruposRepository.findGroupById(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        const inscription =
            await GruposRepository.findInscriptionByUserAndProgram(
                userId,
                group.programa_id
            );

        if (!inscription) {
            throw new Error(
                "El aprendiz no tiene una inscripción en este programa"
            );
        }

        if (inscription.grupo_id !== groupId) {
            throw new Error(
                "El aprendiz no pertenece a este grupo"
            );
        }

        /*
         * Aquí debe ejecutarse la lógica definitiva
         * de expulsión según el campo de estado
         * existente en tu modelo de inscripción.
         *
         * No se modifica el estado directamente porque
         * el schema.prisma proporcionado no define ese campo.
         */

        return {
            message: "Solicitud de expulsión validada",
            inscription,
            reason: data.reason,
        };
    }

    static async suspendLearner(
        groupId: string,
        userId: string,
        data: ReasonInput
    ) {
        const group =
            await GruposRepository.findGroupById(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        const inscription =
            await GruposRepository.findInscriptionByUserAndProgram(
                userId,
                group.programa_id
            );

        if (!inscription) {
            throw new Error(
                "El aprendiz no tiene una inscripción en este programa"
            );
        }

        if (inscription.grupo_id !== groupId) {
            throw new Error(
                "El aprendiz no pertenece a este grupo"
            );
        }

        /*
         * La actualización definitiva depende del campo
         * de suspensión existente en tu schema.prisma.
         */

        return {
            message: "Solicitud de suspensión validada",
            inscription,
            reason: data.reason,
        };
    }

    static async revertExpulsion(
        groupId: string,
        userId: string
    ) {
        const group =
            await GruposRepository.findGroupById(groupId);

        if (!group) {
            throw new Error("El grupo no existe");
        }

        const inscription =
            await GruposRepository.findInscriptionByUserAndProgram(
                userId,
                group.programa_id
            );

        if (!inscription) {
            throw new Error(
                "El aprendiz no tiene una inscripción en este programa"
            );
        }

        /*
         * La reversión depende del campo de estado
         * utilizado para representar la expulsión.
         */

        return {
            message: "Solicitud de reversión validada",
            inscription,
        };
    }
}