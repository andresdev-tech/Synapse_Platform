import { Request, Response } from "express";
import { GroupsService } from "./grupos.service";
import {
    assignLearnerSchema,
    changeGroupSchema,
    reasonSchema,
} from "./grupos.schema";
import { string } from "zod/v4";

export class GroupsController {

    static async getGroupsByProgram(
        req: Request,
        res: Response
    ) {
        try {
            const programId = String(req.params.programId);

            const groups =
                await GroupsService.getGroupsByProgram(programId);

            return res.status(200).json(groups);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    static async getGroupMembers(
        req: Request,
        res: Response
    ) {
        try {
            const groupId = String(req.params.groupId);

            const members =
                await GroupsService.getGroupMembers(groupId);

            return res.status(200).json(members);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    static async getCompleteGroupInfo(
        req: Request,
        res: Response
    ) {
        try {
            const groupId = String(req.params.groupId);

            const group =
                await GroupsService.getCompleteGroupInfo(groupId);

            return res.status(200).json(group);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    static async getPendingInscriptions(
        req: Request,
        res: Response
    ) {
        try {
            const programId = String(req.params.programId);

            const inscriptions =
                await GroupsService.getPendingInscriptions(
                    programId
                );

            return res.status(200).json(inscriptions);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    static async getGroupLearners(
        req: Request,
        res: Response
    ) {
        try {
            const groupId = String(req.params.groupId);

            const learners =
                await GroupsService.getGroupLearners(groupId);

            return res.status(200).json(learners);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    static async getProgramStatistics(
        req: Request,
        res: Response
    ) {
        try {
            const programId = String(req.params.programId);

            const statistics =
                await GroupsService.getProgramStatistics(
                    programId
                );

            return res.status(200).json(statistics);
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    static async assignLearner(
        req: Request,
        res: Response
    ) {
        try {
            const data = assignLearnerSchema.parse(req.body);

            const result =
                await GroupsService.assignLearner(data);

            return res.status(200).json({
                message: "Aprendiz asignado correctamente",
                data: result,
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    static async changeLearnerGroup(
        req: Request,
        res: Response
    ) {
        try {
            const data = changeGroupSchema.parse(req.body);

            const result =
                await GroupsService.changeLearnerGroup(data);

            return res.status(200).json({
                message: "Grupo cambiado correctamente",
                data: result,
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    static async removeLearner(
        req: Request,
        res: Response
    ) {
        try {
            const groupId = String(req.params.groupId);
            const userId = String(req.params.userId);

            const result =
                await GroupsService.removeLearner(
                    groupId,
                    userId
                );

            return res.status(200).json({
                message: "Aprendiz removido correctamente",
                data: result,
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    static async expelLearner(
        req: Request,
        res: Response
    ) {
        try {
            const groupId = String(req.params.groupId);
            const userId = String(req.params.userId);

            const data = reasonSchema.parse(req.body);

            const result =
                await GroupsService.expelLearner(
                    groupId,
                    userId,
                    data
                );

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    static async suspendLearner(
        req: Request,
        res: Response
    ) {
        try {
            const groupId = String(req.params.groupId);
            const userId = String(req.params.userId);

            const data = reasonSchema.parse(req.body);

            const result =
                await GroupsService.suspendLearner(
                    groupId,
                    userId,
                    data
                );

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    static async revertExpulsion(
        req: Request,
        res: Response
    ) {
        try {
            const groupId = String(req.params.groupId);
            const userId = String(req.params.userId);

            const result =
                await GroupsService.revertExpulsion(
                    groupId,
                    userId
                );

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }
}