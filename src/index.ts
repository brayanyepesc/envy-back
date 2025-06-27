import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createConnectionToDatabase } from "./config/database";
import { createConnectionToRedis } from "./config/redis";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(express.json());

app.listen(PORT, async () => {
  await createConnectionToDatabase();
  await createConnectionToRedis();
  console.log(`Server running on port ${PORT}`);
});
