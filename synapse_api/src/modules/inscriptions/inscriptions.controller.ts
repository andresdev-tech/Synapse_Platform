import { Request, Response } from "express";
import { InscriptionsService } from "./inscriptions.service";

export class InscriptionsController {

    static async getInscriptions(
        req: Request,
        res: Response
    ) {
        try {

            const inscriptions =
                await InscriptionsService.getInscriptions();

            return res.status(200).json(
                inscriptions
            );

        } catch (error: any) {

            console.log(
                "Error getting inscriptions:",
                error
            );

            return res.status(500).json({
                message: error.message || error
            });
        }
    }

    static async getByPrograma(
        req: Request,
        res: Response
    ) {
        try {

            const programa_id =
                Number(req.params.programaId);

            const inscriptions =
                await InscriptionsService.getByPrograma(
                    programa_id
                );

            return res.status(200).json(
                inscriptions
            );

        } catch (error: any) {

            console.log(
                "Error getting inscriptions by program:",
                error
            );

            return res.status(400).json({
                message: error.message || error
            });
        }
    }

    static async create(
        req: Request,
        res: Response
    ) {
        try {

            const { programa_id } = req.body;

            const usuario_id =
                Number(res.locals.usuario_id);

            const inscription =
                await InscriptionsService.create(
                    usuario_id,
                    Number(programa_id)
                );

            return res.status(201).json({
                message: "Inscripción creada correctamente",
                data: inscription
            });

        } catch (error: any) {

            console.log(
                "Error creating inscription:",
                error
            );

            return res.status(400).json({
                message: error.message || error
            });
        }
    }

    static async cancel(
        req: Request,
        res: Response
    ) {
        try {

            const inscription_id =
                Number(req.params.inscripcionId);

            const usuario_id =
                Number(res.locals.usuario_id);

            const deletedInscription =
                await InscriptionsService.cancel(
                    inscription_id,
                    usuario_id
                );

            return res.status(200).json({
                message: "Inscripción cancelada correctamente",
                data: deletedInscription
            });

        } catch (error: any) {

            console.log(
                "Error cancelling inscription:",
                error
            );

            return res.status(400).json({
                message: error.message || error
            });
        }
    }

    static async changeStatus(
        req: Request,
        res: Response
    ) {
        try {

            const inscription_id =
                Number(req.params.inscripcionId);

            const { estado } = req.body;

            const updatedInscription =
                await InscriptionsService.changeStatus(
                    inscription_id,
                    estado
                );

            return res.status(200).json({
                message:
                    "Estado de la inscripción actualizado correctamente",
                data: updatedInscription
            });

        } catch (error: any) {

            console.log(
                "Error changing inscription status:",
                error
            );

            return res.status(400).json({
                message: error.message || error
            });
        }
    }

    static async getMyInscriptions(
        req: Request,
        res: Response
    ) {
        try {

            const usuario_id =
                Number(res.locals.usuario_id);

            const inscriptions =
                await InscriptionsService.getMyInscriptions(
                    usuario_id
                );

            return res.status(200).json(
                inscriptions
            );

        } catch (error: any) {

            console.log(
                "Error getting my inscriptions:",
                error
            );

            return res.status(400).json({
                message: error.message || error
            });
        }
    }
}