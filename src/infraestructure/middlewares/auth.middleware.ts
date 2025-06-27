import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ success: false, message: "Token de autorización requerido" });
    return;
  }
  
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ success: false, message: "Formato de token inválido" });
    return;
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Token inválido o expirado" });
  }
}
