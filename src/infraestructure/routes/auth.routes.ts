import express from "express";
import { AuthService } from "../../application/services/auth.service";
import { asyncHandler } from "../middlewares/async.middleware";
import { createError } from "../middlewares/error.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { rateLimit, RATE_LIMITS } from "../middlewares/rate-limit.middleware";

export const authRouter = express.Router();

authRouter.post("/register", 
  rateLimit(RATE_LIMITS.AUTH),
  asyncHandler(async (req, res) => {
    const userData = AuthService.validateRegisterData(req.body);
    await AuthService.register(userData);
    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente"
    });
  })
);

authRouter.post("/login", 
  rateLimit(RATE_LIMITS.AUTH),
  asyncHandler(async (req, res) => {
    const credentials = AuthService.validateLoginData(req.body);
    const { token, user } = await AuthService.login(credentials);
    res.json({
      success: true,
      token,
      user
    });
  })
);

authRouter.post("/logout", authenticate, asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = (req as any).user.id;
  
  if (token) {
    await AuthService.logout(token, userId);
  }
  
  res.json({
    success: true,
    message: "Logout exitoso"
  });
}));
