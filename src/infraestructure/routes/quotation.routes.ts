import express from "express";
import { QuotationService } from "../../application/services/quotation.service";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async.middleware";

export const quotationRouter = express.Router();

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

quotationRouter.get("/tariffs", asyncHandler(async (req, res) => {
  const tariffs = await QuotationService.getAllTariffs();
  res.json({
    success: true,
    data: tariffs
  });
}));
