import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extender la interfaz Request de Express para incluir el usuario
export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Para entornos profesionales, el token viene en el header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default_dev_secret_for_synapse";

    // Verificamos el token
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    return res.status(403).json({ error: "Acceso denegado. Requiere privilegios de administrador." });
  }
};
