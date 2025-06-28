import express from "express";
import { QuotationService } from "../../application/services/quotation.service";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async.middleware";

export const quotationRouter = express.Router();

/**
 * @swagger
 * /api/quotation/quotation:
 *   post:
 *     summary: Obtener cotización de envío
 *     tags: [Cotización]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuotationRequestDto'
 *     responses:
 *       200:
 *         description: Cotización generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/QuotationResponseDto'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
quotationRouter.post("/quotation", authenticate, asyncHandler(async (req, res) => {
  const { weight, length, width, height, origin, destination } = req.body;
  const quotation = await QuotationService.getQuotation(
    weight,
    length,
    width,
    height,
    origin,
    destination
  );
  res.json({
    success: true,
    data: quotation
  });
}));

/**
 * @swagger
 * /api/quotation/tariffs:
 *   get:
 *     summary: Obtener todas las tarifas disponibles
 *     tags: [Cotización]
 *     responses:
 *       200:
 *         description: Lista de tarifas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TariffDto'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
quotationRouter.get("/tariffs", asyncHandler(async (req, res) => {
  const tariffs = await QuotationService.getAllTariffs();
  res.json({
    success: true,
    data: tariffs
  });
}));
