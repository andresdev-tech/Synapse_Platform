import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { string } from "zod/v4";


export class UsersController {
    
    static async getProfile(
        req: Request,
        res: Response
    ) {
        try {
        
            const id = (req as any).user?.id;

            const user = await UsersService.getProfile(id);
            
            res.status(200).json(user);
        } catch (error: any) {
            res.status(500).json({
                message: error.message,
            });
        }
    }
    
    static async getById(
        req: Request,
        res: Response
    ) {
        try {
            const user = await UsersService.getById(req.params.id as string);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async getAll(
        req: Request,
        res: Response
    ) {
        try {
            const users = await UsersService.getAll();
            res.status(200).json({ 
                success: true,
                data: users 
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async create(
        req: Request,
        res: Response
    ) {
        try {
            const user = await UsersService.create(req.body);
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async update(
        req: Request,
        res: Response
    ) {
        try {
            const id = (req as any).user?.id;
            console.log("userId: ", id)
            const user = await UsersService.update(id, req.body);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async updateRole(
        req: Request,
        res: Response
    ) {
        try {
            const id = req.params.id as string;
            const rolId = req.body.rolId;
            const user = await UsersService.update(id, { rol_id: rolId });
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async delete(
        req: Request,
        res: Response
    ) {
        try {
            const user = await UsersService.delete(String(req.params.id));
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async findByEmail(
        req: Request,
        res: Response
    ) {
        try {
            const user = await UsersService.findByEmail(String(req.params.email));
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
