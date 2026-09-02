import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${err.message || "Error interno del servidor"}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Error interno del servidor",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
