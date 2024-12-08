import "express";

declare global {
  namespace Express {
    export interface Request {
      id?: string; // Add the custom `id` property
    }
  }
}
