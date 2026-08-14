import { InscriptionsRepository } from "./inscriptions.repository";

export class InscriptionsService {

    static async getInscriptions() {
        try {

            const inscriptions =
                await InscriptionsRepository.getInscriptions();

            return inscriptions;

        } catch (error: any) {

            console.log(
                "Error getting inscriptions:",
                error
            );

            throw error;
        }
    }

    static async getByPrograma(
        programa_id: number
    ) {
        try {

            if (
                !programa_id ||
                programa_id <= 0
            ) {
                throw new Error(
                    "El programa no es válido"
                );
            }

            const inscriptions =
                await InscriptionsRepository.getByPrograma(
                    programa_id
                );

            return inscriptions;

        } catch (error: any) {

            console.log(
                "Error getting inscriptions by program:",
                error
            );

            throw error;
        }
    }

    static async getMyInscriptions(
        usuario_id: number
    ) {
        try {

            if (
                !usuario_id ||
                usuario_id <= 0
            ) {
                throw new Error(
                    "El usuario no es válido"
                );
            }

            const inscriptions =
                await InscriptionsRepository.getByUsers(
                    usuario_id
                );

            return inscriptions;

        } catch (error: any) {

            console.log(
                "Error getting user inscriptions:",
                error
            );

            throw error;
        }
    }

    static async create(
        usuario_id: number,
        programa_id: number
    ) {
        try {

            if (
                !usuario_id ||
                usuario_id <= 0
            ) {
                throw new Error(
                    "El usuario no es válido"
                );
            }

            if (
                !programa_id ||
                programa_id <= 0
            ) {
                throw new Error(
                    "El programa no es válido"
                );
            }

            const existingInscription =
                await InscriptionsRepository.searchByUserAndProgram(
                    usuario_id,
                    programa_id
                );

            if (existingInscription) {
                throw new Error(
                    "El usuario ya está inscrito en este programa"
                );
            }

            const inscription =
                await InscriptionsRepository.create(
                    usuario_id,
                    programa_id
                );

            return inscription;

        } catch (error: any) {

            console.log(
                "Error creating inscription:",
                error
            );

            throw error;
        }
    }

    static async cancel(
        inscription_id: number,
        usuario_id: number
    ) {
        try {

            if (
                !inscription_id ||
                inscription_id <= 0
            ) {
                throw new Error(
                    "La inscripción no es válida"
                );
            }

            if (
                !usuario_id ||
                usuario_id <= 0
            ) {
                throw new Error(
                    "El usuario no es válido"
                );
            }

            const inscription =
                await InscriptionsRepository.getById(
                    inscription_id
                );

            if (!inscription) {
                throw new Error(
                    "La inscripción no existe"
                );
            }

            if (
                inscription.usuario_id !== usuario_id
            ) {
                throw new Error(
                    "No tienes permisos para cancelar esta inscripción"
                );
            }

            const deletedInscription =
                await InscriptionsRepository.delete(
                    inscription_id
                );

            return deletedInscription;

        } catch (error: any) {

            console.log(
                "Error cancelling inscription:",
                error
            );

            throw error;
        }
    }

    static async changeStatus(
        inscription_id: number,
        estado: string
    ) {
        try {

            if (
                !inscription_id ||
                inscription_id <= 0
            ) {
                throw new Error(
                    "La inscripción no es válida"
                );
            }

            if (!estado) {
                throw new Error(
                    "El estado es obligatorio"
                );
            }

            const allowedStatuses = [
                "pendiente",
                "aceptada",
                "rechazada",
                "cancelada"
            ];

            if (!allowedStatuses.includes(estado)) {
                throw new Error(
                    "El estado de la inscripción no es válido"
                );
            }

            const inscription =
                await InscriptionsRepository.getById(
                    inscription_id
                );

            if (!inscription) {
                throw new Error(
                    "La inscripción no existe"
                );
            }

            const updatedInscription =
                await InscriptionsRepository.changeStatus(
                    inscription_id,
                    estado
                );

            return updatedInscription;

        } catch (error: any) {

            console.log(
                "Error changing inscription status:",
                error
            );

            throw error;
        }
    }
}