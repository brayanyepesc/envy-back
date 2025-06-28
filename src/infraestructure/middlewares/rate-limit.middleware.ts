import { Request, Response, NextFunction } from "express";
import { redisClient } from "../../config/redis";

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo número de peticiones por ventana
  message?: string;
  keyPrefix?: string;
}

export function rateLimit(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const prefix = config.keyPrefix || 'global';
    const key = `rate_limit:${prefix}:${ip}`;
    
    try {
      // Obtener el número actual de peticiones
      const currentRequests = await redisClient.get(key);
      const requests = currentRequests ? parseInt(currentRequests) : 0;
      
      if (requests >= config.maxRequests) {
        res.status(429).json({
          success: false,
          message: config.message || "Demasiadas peticiones. Intenta de nuevo más tarde.",
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
        return;
      }
      
      // Incrementar contador
      if (requests === 0) {
        // Primera petición, establecer con TTL
        await redisClient.setEx(key, Math.ceil(config.windowMs / 1000), '1');
      } else {
        // Incrementar contador existente
        await redisClient.incr(key);
      }
      
      // Agregar headers de rate limit
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - requests - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
      
      next();
    } catch (error) {
      console.error('Error en rate limiting:', error);
      // Si hay error en Redis, continuar sin rate limiting
      next();
    }
  };
}

// Configuraciones predefinidas
export const RATE_LIMITS = {
  STRICT: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    message: "Demasiadas peticiones. Máximo 100 peticiones por 15 minutos.",
    keyPrefix: 'strict'
  },
  MODERATE: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 300,
    message: "Demasiadas peticiones. Máximo 300 peticiones por 15 minutos.",
    keyPrefix: 'moderate'
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 10,
    message: "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
    keyPrefix: 'auth'
  }
} as const; 