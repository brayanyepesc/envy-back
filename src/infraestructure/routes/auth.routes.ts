import express from "express";
import { AuthService } from "../../application/services/auth.service";
import { asyncHandler } from "../middlewares/async.middleware";
import { createError } from "../middlewares/error.middleware";

export const authRouter = express.Router();

authRouter.post("/register", asyncHandler(async (req, res) => {
  const userData = AuthService.validateRegisterData(req.body);
  await AuthService.register(userData);
  res.status(201).json({
    success: true,
    message: "Usuario registrado correctamente"
  });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const credentials = AuthService.validateLoginData(req.body);
  const { token, user } = await AuthService.login(credentials);
  res.json({
    success: true,
    token,
    user
  });
}));
