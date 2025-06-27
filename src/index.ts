import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createConnectionToDatabase } from "./config/database";
import { createConnectionToRedis } from "./config/redis";
import { authRouter } from "./infraestructure/routes/auth.routes";
import { errorHandler } from "./infraestructure/middlewares/error.middleware";
import { APP_CONFIG } from "./config/constants";
import { quotationRouter } from "./infraestructure/routes/quotation.routes";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api", quotationRouter);

app.use(errorHandler);

//TESTEO
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(APP_CONFIG.PORT, async () => {
  try {
    await createConnectionToDatabase();
    await createConnectionToRedis();
    console.log(`Servidor corriendo en el puerto ${APP_CONFIG.PORT}`);
    console.log(`Entorno: ${APP_CONFIG.NODE_ENV}`);
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
});
