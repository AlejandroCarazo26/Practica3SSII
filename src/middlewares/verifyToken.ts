import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {NextFunction, Request, Response} from "express";

dotenv.config();

const SECRET = process.env.SECRET;

export interface AuthRequest extends Request {
    user?: jwt.JwtPayload | string;
};

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const headerToken = req.headers["authorization"];
    const token = headerToken && headerToken.split(" ")[1];

    if(!token){
        return res.status(401).json({message: "No hay token"});
    };

    jwt.verify(token, SECRET as string, (err, decoded) => {
        if(err){
            return res.status(401).json({message: "Token inválido"});
        }

        req.user= decoded;
        next();
    })
}
