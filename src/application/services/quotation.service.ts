import { ERROR_MESSAGES, HTTP_STATUS } from "../../config/constants";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { QuotationRepository } from "../../persistence/repositories/quotation.repository";

export class QuotationService {
  static async getQuotation(
    weight: number,
    length: number,
    width: number,
    height: number,
    origin: string,
    destination: string
  ) {
    if (!weight || !length || !width || !height || !origin || !destination) {
      throw createError(
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const volumeWeight = (length * width * height) / 2500;
    const selectedWeight = Math.max(weight, volumeWeight);

    const tariff = await QuotationRepository.findByOriginDestination(
      origin,
      destination
    );

    if (!tariff) {
      throw createError(
        ERROR_MESSAGES.DATABASE.TARIFF_NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
    
    const price = selectedWeight * tariff.price_per_kg;
    return price;
  }
}
