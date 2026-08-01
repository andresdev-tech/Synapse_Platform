import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
   throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET: Secret = process.env.JWT_SECRET;

interface TokenPayload extends JwtPayload {
   id: number;
}

export const generateToken = (
   payload: TokenPayload,
   expiresIn: SignOptions["expiresIn"]
) => {
   return jwt.sign(payload, JWT_SECRET, {
      expiresIn,
   });
};

export const verifyToken = (token: string): TokenPayload => {
   return jwt.verify(token, JWT_SECRET) as TokenPayload;
};