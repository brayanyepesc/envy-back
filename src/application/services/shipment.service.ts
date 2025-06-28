import { ShipmentRepository } from "../../persistence/repositories/shipment.repository";
import { CreateShipmentRequestDto, CreateShipmentResponseDto, ShipmentDetailsResponseDto } from "../../domain/dto/shipment.dto";
import { Shipment } from "../../domain/interfaces/shipment.interface";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { ERROR_MESSAGES, HTTP_STATUS, SHIPPING_STATUS } from "../../config/constants";
import { Request } from "express";
import { RedisCache } from "../../config/redis";

export class ShipmentService {
  private static extractUserIdFromRequest(req: Request): number {
    const user = (req as any).user;
    if (!user || !user.id) {
      throw createError("Usuario no autenticado", HTTP_STATUS.UNAUTHORIZED);
    }
    return user.id;
  }

  static validateShipmentData(data: any): CreateShipmentRequestDto {
    const { origin, destination, weight, length, width, height, quotedPrice } = data;

    if (!origin || !destination || !weight || !length || !width || !height || !quotedPrice) {
      throw createError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
    }

    if (weight <= 0) {
      throw createError(ERROR_MESSAGES.VALIDATION.INVALID_WEIGHT, HTTP_STATUS.BAD_REQUEST);
    }

    if (length <= 0 || width <= 0 || height <= 0) {
      throw createError(ERROR_MESSAGES.VALIDATION.INVALID_DIMENSIONS, HTTP_STATUS.BAD_REQUEST);
    }

    if (quotedPrice <= 0) {
      throw createError(ERROR_MESSAGES.VALIDATION.INVALID_PRICE, HTTP_STATUS.BAD_REQUEST);
    }

    return {
      origin,
      destination,
      weight,
      length,
      width,
      height,
      quotedPrice,
    };
  }

  static async createShipment(userId: number, shipmentData: CreateShipmentRequestDto): Promise<CreateShipmentResponseDto> {
    const shipment: Omit<Shipment, "id" | "status" | "trackingNumber" | "createdAt" | "updatedAt"> = {
      userId,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      package: {
        weight: shipmentData.weight,
        length: shipmentData.length,
        width: shipmentData.width,
        height: shipmentData.height,
      },
      quotedPrice: shipmentData.quotedPrice,
    };

    const shipmentId = await ShipmentRepository.create(shipment);
    const createdShipment = await ShipmentRepository.findById(shipmentId);

    if (!createdShipment) {
      throw createError(ERROR_MESSAGES.DATABASE.SHIPMENT_FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Invalidar cache de envíos del usuario
    await RedisCache.invalidateUserShipments(userId);

    return {
      id: shipmentId,
      trackingNumber: createdShipment.trackingNumber!,
      status: createdShipment.status,
      message: "Shipment created successfully with 'waiting' status",
    };
  }

  static async getShipmentById(shipmentId: number): Promise<ShipmentDetailsResponseDto> {
    // Intentar obtener del cache primero
    const cachedShipment = await RedisCache.getCachedShipmentDetails(shipmentId);
    if (cachedShipment) {
      return cachedShipment;
    }

    const shipment = await ShipmentRepository.findById(shipmentId);
    
    if (!shipment) {
      throw createError("Shipment not found", HTTP_STATUS.BAD_REQUEST);
    }

    const shipmentResponse = {
      id: shipment.id!,
      trackingNumber: shipment.trackingNumber!,
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      package: shipment.package,
      quotedPrice: shipment.quotedPrice,
      createdAt: shipment.createdAt!,
      updatedAt: shipment.updatedAt!,
    };

    // Guardar en cache
    await RedisCache.cacheShipmentDetails(shipmentId, shipmentResponse);

    return shipmentResponse;
  }

  static async getUserShipments(req: Request): Promise<ShipmentDetailsResponseDto[]> {
    const userId = this.extractUserIdFromRequest(req);
    
    // Intentar obtener del cache primero
    const cachedShipments = await RedisCache.getCachedUserShipments(userId);
    if (cachedShipments) {
      return cachedShipments;
    }

    const shipments = await ShipmentRepository.findByUserId(userId);
    
    const shipmentsResponse = shipments.map(shipment => ({
      id: shipment.id!,
      trackingNumber: shipment.trackingNumber!,
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      package: shipment.package,
      quotedPrice: shipment.quotedPrice,
      createdAt: shipment.createdAt!,
      updatedAt: shipment.updatedAt!,
    }));

    // Guardar en cache
    await RedisCache.cacheUserShipments(userId, shipmentsResponse);

    return shipmentsResponse;
  }

  static async getShipmentTracking(trackingNumber: string) {
    const shipment = await ShipmentRepository.findByTrackingNumber(trackingNumber);
    
    if (!shipment) {
      throw createError("Shipment not found", HTTP_STATUS.BAD_REQUEST);
    }

    const statusHistory = await ShipmentRepository.getStatusHistory(shipment.id!);

    return {
      shipmentId: shipment.id!,
      trackingNumber: shipment.trackingNumber!,
      currentStatus: shipment.status,
      history: statusHistory.map(history => ({
        status: history.status,
        description: history.description,
        location: history.location,
        timestamp: history.createdAt,
      })),
    };
  }
} 