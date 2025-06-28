import express from "express";
import { ShipmentService } from "../../application/services/shipment.service";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async.middleware";

export const shipmentRouter = express.Router();

/**
 * @swagger
 * /api/shipment:
 *   post:
 *     summary: Crear un nuevo envío
 *     tags: [Envíos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShipmentRequestDto'
 *     responses:
 *       201:
 *         description: Envío creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CreateShipmentResponseDto'
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
shipmentRouter.post(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id;
    const shipmentData = ShipmentService.validateShipmentData(req.body);
    
    const shipment = await ShipmentService.createShipment(userId, shipmentData);
    
    res.status(201).json({
      success: true,
      data: shipment
    });
  })
);

/**
 * @swagger
 * /api/shipment/{id}:
 *   get:
 *     summary: Obtener un envío por ID
 *     tags: [Envíos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del envío
 *         example: 1
 *     responses:
 *       200:
 *         description: Envío obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ShipmentDetailsResponseDto'
 *       404:
 *         description: Envío no encontrado
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
shipmentRouter.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const shipmentId = parseInt(req.params.id);
    const shipment = await ShipmentService.getShipmentById(shipmentId);
    
    res.json({
      success: true,
      data: shipment
    });
  })
);

/**
 * @swagger
 * /api/shipment:
 *   get:
 *     summary: Obtener todos los envíos del usuario
 *     tags: [Envíos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, in_transit, delivered]
 *         description: Filtrar por estado del envío
 *         example: "in_transit"
 *     responses:
 *       200:
 *         description: Lista de envíos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/ShipmentDetailsResponseDto'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
shipmentRouter.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const shipments = await ShipmentService.getUserShipments(req);
    
    res.json({
      success: true,
      data: shipments
    });
  })
);

/**
 * @swagger
 * /api/shipment/tracking/{trackingNumber}:
 *   get:
 *     summary: Obtener seguimiento de un envío por número de tracking
 *     tags: [Envíos]
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de tracking del envío
 *         example: "ENV2024001"
 *     responses:
 *       200:
 *         description: Seguimiento obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TrackingResponseDto'
 *       404:
 *         description: Envío no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
shipmentRouter.get(
  "/tracking/:trackingNumber",
  asyncHandler(async (req, res) => {
    const { trackingNumber } = req.params;
    const tracking = await ShipmentService.getShipmentTracking(trackingNumber);
    
    res.json({
      success: true,
      data: tracking
    });
  })
);
