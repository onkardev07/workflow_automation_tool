import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

interface JwtPayload {
  id: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization;

  if (!token) {
    res.status(403).json({ message: "Authorization token is missing" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as JwtPayload;
    req.id = payload.id;
    next();
  } catch (e) {
    res.status(403).json({ message: "You are not logged in" });
  }
}
