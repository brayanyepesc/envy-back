import express from "express";
import { AuthService } from "../../application/services/auth.service";
import { asyncHandler } from "../middlewares/async.middleware";
import { createError } from "../middlewares/error.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { rateLimit, RATE_LIMITS } from "../middlewares/rate-limit.middleware";

export const authRouter = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDto'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado correctamente"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token para autenticación
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión de usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout exitoso"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
