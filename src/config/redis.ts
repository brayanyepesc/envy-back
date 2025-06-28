import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

export async function createConnectionToRedis() {
  await redisClient.connect();
  console.log("Redis Connected");
}

// Configuración de TTL (Time To Live) para diferentes tipos de datos
export const CACHE_TTL = {
  USER_SHIPMENTS: 300, // 5 minutos
  SHIPMENT_DETAILS: 600, // 10 minutos
  QUOTATION_RESULTS: 1800, // 30 minutos
  TOKEN_BLACKLIST: 86400, // 24 horas (mismo tiempo que JWT)
} as const;

// Métodos de cache genéricos
export class RedisCache {
  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error getting cache:", error);
      return null;
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error("Error deleting cache:", error);
    }
  }

  static async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error("Error deleting pattern cache:", error);
    }
  }

  static async clearRateLimits(): Promise<void> {
    try {
      await this.deletePattern("rate_limit:*");
      console.log("Rate limits cleared");
    } catch (error) {
      console.error("Error clearing rate limits:", error);
    }
  }

  // Métodos específicos para tokens
  static async addToBlacklist(token: string, userId: number): Promise<void> {
    const key = `blacklist:${token}`;
    await this.set(key, { userId, blacklistedAt: new Date().toISOString() }, CACHE_TTL.TOKEN_BLACKLIST);
  }

  static async isBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const blacklisted = await this.get(key);
    return blacklisted !== null;
  }

  // Métodos específicos para cache de datos
  static async cacheUserShipments(userId: number, shipments: any[]): Promise<void> {
    const key = `user:${userId}:shipments`;
    await this.set(key, shipments, CACHE_TTL.USER_SHIPMENTS);
  }

  static async getCachedUserShipments(userId: number): Promise<any[] | null> {
    const key = `user:${userId}:shipments`;
    return await this.get<any[]>(key);
  }

  static async invalidateUserShipments(userId: number): Promise<void> {
    const key = `user:${userId}:shipments`;
    await this.delete(key);
  }

  static async cacheShipmentDetails(shipmentId: number, shipment: any): Promise<void> {
    const key = `shipment:${shipmentId}`;
    await this.set(key, shipment, CACHE_TTL.SHIPMENT_DETAILS);
  }

  static async getCachedShipmentDetails(shipmentId: number): Promise<any | null> {
    const key = `shipment:${shipmentId}`;
    return await this.get<any>(key);
  }

  static async invalidateShipmentDetails(shipmentId: number): Promise<void> {
    const key = `shipment:${shipmentId}`;
    await this.delete(key);
  }
}
