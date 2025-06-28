import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createConnectionToDatabase } from "./config/database";
import { createConnectionToRedis } from "./config/redis";
import { authRouter } from "./infraestructure/routes/auth.routes";
import { quotationRouter } from "./infraestructure/routes/quotation.routes";
import { shipmentRouter } from "./infraestructure/routes/shipment.routes";
import { errorHandler } from "./infraestructure/middlewares/error.middleware";
import { rateLimit, RATE_LIMITS } from "./infraestructure/middlewares/rate-limit.middleware";
import { RedisCache } from "./config/redis";
import { APP_CONFIG } from "./config/constants";
import { specs, swaggerUi } from "./config/swagger";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

// Rate limiting global moderado
app.use(rateLimit(RATE_LIMITS.MODERATE));

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Envy Back API Documentation'
}));

app.use("/api/auth", authRouter);
app.use("/api/quotation", quotationRouter);
app.use("/api/shipment", shipmentRouter);

app.use(errorHandler);

//TESTEO
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.post("/clear-rate-limits", async (req, res) => {
  await RedisCache.clearRateLimits();
  res.json({ success: true, message: "Rate limits cleared" });
});

app.listen(APP_CONFIG.PORT, async () => {
  try {
    await createConnectionToDatabase();
    await createConnectionToRedis();
    console.log(`Servidor corriendo en el puerto ${APP_CONFIG.PORT}`);
    console.log(`Entorno: ${APP_CONFIG.NODE_ENV}`);
    console.log(`Documentación Swagger disponible en: http://localhost:${APP_CONFIG.PORT}/docs`);
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
});
