import { getConnection } from "../../config/database";
import { Shipment, ShipmentStatusHistory } from "../../domain/interfaces/shipment.interface";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { ERROR_MESSAGES, HTTP_STATUS, SHIPPING_STATUS } from "../../config/constants";

export class ShipmentRepository {
  static async create(shipment: Omit<Shipment, "id" | "status" | "trackingNumber" | "createdAt" | "updatedAt">): Promise<number> {
    try {
      const trackingNumber = this.generateTrackingNumber();
      
      const [result] = await getConnection().execute(
        `INSERT INTO shipments 
        (user_id, origin, destination, package_weight, package_length, package_width, package_height, 
         quoted_price, status, tracking_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          shipment.userId,
          shipment.origin,
          shipment.destination,
          shipment.package.weight,
          shipment.package.length,
          shipment.package.width,
          shipment.package.height,
          shipment.quotedPrice,
          SHIPPING_STATUS.WAITING,
          trackingNumber,
        ]
      );
      
      const shipmentId = (result as any).insertId;
      
      await this.createStatusHistory(shipmentId, SHIPPING_STATUS.WAITING, "Shipment created");
      
      return shipmentId;
    } catch (error) {
      console.error("Error al crear envío:", error);
      throw createError(ERROR_MESSAGES.DATABASE.SHIPMENT_CREATE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async findById(id: number): Promise<Shipment | null> {
    try {
      const [rows] = await getConnection().execute(
        `SELECT 
          id, user_id as userId, origin, destination,
          package_weight as weight, package_length as length, 
          package_width as width, package_height as height,
          quoted_price as quotedPrice, status, tracking_number as trackingNumber,
          created_at as createdAt, updated_at as updatedAt
        FROM shipments WHERE id = ?`,
        [id]
      );
      
      const shipments = rows as any[];
      if (!shipments[0]) return null;

      const shipment = shipments[0];
      return {
        id: shipment.id,
        userId: shipment.userId,
        origin: shipment.origin,
        destination: shipment.destination,
        package: {
          weight: shipment.weight,
          length: shipment.length,
          width: shipment.width,
          height: shipment.height,
        },
        quotedPrice: shipment.quotedPrice,
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      };
    } catch (error) {
      console.error("Error al buscar envío:", error);
      throw createError(ERROR_MESSAGES.DATABASE.SHIPMENT_FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async findByUserId(userId: number): Promise<Shipment[]> {
    try {
      const [rows] = await getConnection().execute(
        `SELECT 
          id, user_id as userId, origin, destination,
          package_weight as weight, package_length as length, 
          package_width as width, package_height as height,
          quoted_price as quotedPrice, status, tracking_number as trackingNumber,
          created_at as createdAt, updated_at as updatedAt
        FROM shipments WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      
      const shipments = rows as any[];
      return shipments.map(shipment => ({
        id: shipment.id,
        userId: shipment.userId,
        origin: shipment.origin,
        destination: shipment.destination,
        package: {
          weight: shipment.weight,
          length: shipment.length,
          width: shipment.width,
          height: shipment.height,
        },
        quotedPrice: shipment.quotedPrice,
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      }));
    } catch (error) {
      console.error("Error al buscar envíos del usuario:", error);
      throw createError(ERROR_MESSAGES.DATABASE.SHIPMENT_FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    try {
      const [rows] = await getConnection().execute(
        `SELECT 
          id, user_id as userId, origin, destination,
          package_weight as weight, package_length as length, 
          package_width as width, package_height as height,
          quoted_price as quotedPrice, status, tracking_number as trackingNumber,
          created_at as createdAt, updated_at as updatedAt
        FROM shipments WHERE tracking_number = ?`,
        [trackingNumber]
      );
      
      const shipments = rows as any[];
      if (!shipments[0]) return null;

      const shipment = shipments[0];
      return {
        id: shipment.id,
        userId: shipment.userId,
        origin: shipment.origin,
        destination: shipment.destination,
        package: {
          weight: shipment.weight,
          length: shipment.length,
          width: shipment.width,
          height: shipment.height,
        },
        quotedPrice: shipment.quotedPrice,
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      };
    } catch (error) {
      console.error("Error al buscar envío por número de seguimiento:", error);
      throw createError(ERROR_MESSAGES.DATABASE.SHIPMENT_FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async createStatusHistory(shipmentId: number, status: string, description: string, location?: string): Promise<void> {
    try {
      await getConnection().execute(
        `INSERT INTO shipment_status_history 
        (shipment_id, status, description, location)
        VALUES (?, ?, ?, ?)`,
        [shipmentId, status, description, location ?? null]
      );
    } catch (error) {
      console.error("Error al crear historial de estado:", error);
      throw createError(ERROR_MESSAGES.DATABASE.STATUS_HISTORY_CREATE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async getStatusHistory(shipmentId: number): Promise<ShipmentStatusHistory[]> {
    try {
      const [rows] = await getConnection().execute(
        `SELECT 
          id, shipment_id as shipmentId, status, description, location,
          created_at as createdAt
        FROM shipment_status_history 
        WHERE shipment_id = ? 
        ORDER BY created_at ASC`,
        [shipmentId]
      );
      
      return rows as ShipmentStatusHistory[];
    } catch (error) {
      console.error("Error al obtener historial de estados:", error);
      throw createError(ERROR_MESSAGES.DATABASE.SHIPMENT_FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  private static generateTrackingNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ENV${timestamp.slice(-6)}${random}`;
  }
}
