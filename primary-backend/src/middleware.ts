import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

interface JwtPayload {
  id: string; // Define the structure of your JWT payload
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
    const payload = jwt.verify(token, JWT_PASSWORD) as JwtPayload; // Type assertion
    req.id = payload.id; // Attach the `id` to the request object
    next(); // Pass control to the next middleware or route handler
  } catch (e) {
    res.status(403).json({ message: "You are not logged in" });
  }
}
