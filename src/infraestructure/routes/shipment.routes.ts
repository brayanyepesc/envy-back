import express from "express";
import { ShipmentService } from "../../application/services/shipment.service";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async.middleware";

export const shipmentRouter = express.Router();

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
