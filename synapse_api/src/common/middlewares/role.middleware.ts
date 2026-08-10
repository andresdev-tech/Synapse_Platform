// src/common/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from "express";
import  { GetRoleNameCort }  from '../../common/constants/roles'

export const roleMiddleware = (roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = req as any;

    const roleId = GetRoleNameCort(user.user.rol);

    console.log("USER:", user.user);
    console.log("USER ROLE:", user.user.rol);
    console.log("ROLE ID:", roleId);
    console.log("USER ID:", user.user.id);
    console.log("ROLES:", roles);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    if (!roles.includes(roleId)) {
      console.log("ROLE ID NOT IN ROLES", roleId, roles);
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};