import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Error interno del servidor";

  console.error(`[${new Date().toISOString()}] Error:`, {
    method: req.method,
    path: req.path,
    statusCode,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const createError = (message: string, statusCode: number = 400): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}; 