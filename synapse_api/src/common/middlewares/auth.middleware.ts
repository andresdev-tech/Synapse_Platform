import jwt from "jsonwebtoken";

export function authMiddleware(req: any, res: any, next: any) {
  try {

    const authHeader = req.headers.authorization;
    const secret = process.env.JWT_SECRET!

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token mal formado"
      });
    }

    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    const userId = req.user.id;

    console.log("USER ID:", userId);

    return next();

  } catch (error: any) {

    console.log("JWT ERROR:", error.message); // 👈 IMPORTANTE PARA DEBUG
    console.log('name error: ', error.name);
    

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token invalido o expirado"
    });
  }
}