import express from "express";
import { QuotationService } from "../../application/services/quotation.service";
import { authenticate } from "../middlewares/auth.middleware";

export const quotationRouter = express.Router();

quotationRouter.post("/quotation", authenticate, (req, res, next) => {
  (async () => {
    const { weight, length, width, height, origin, destination } = req.body;
    const price = await QuotationService.getQuotation(
      weight,
      length,
      width,
      height,
      origin,
      destination
    );
    res.json({ price });
  })().catch(next);
});
