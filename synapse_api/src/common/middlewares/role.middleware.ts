// src/common/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = req as any;

    console.log("USER:", user);
    console.log("USER ROLE:", user.role);
    console.log("USER ID:", user.id);
    console.log("ROLES:", roles);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};