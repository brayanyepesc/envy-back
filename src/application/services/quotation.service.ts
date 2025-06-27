import { ERROR_MESSAGES, HTTP_STATUS, APP_CONFIG } from "../../config/constants";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { QuotationRepository } from "../../persistence/repositories/quotation.repository";
import { QuotationRequestDto, QuotationResponseDto } from "../../domain/dto/quotation.dto";
import { Tariff } from "../../domain/interfaces/tariff.interface";

export class QuotationService {

  static calculateVolumeWeight(length: number, width: number, height: number): number {
    const volumeWeight = (length * width * height) / APP_CONFIG.VOLUME_WEIGHT_DIVISOR;
    return Math.ceil(volumeWeight); 
  }

  static calculateChargedWeight(weight: number, volumeWeight: number): number {
    return Math.max(weight, volumeWeight);
  }

  static calculatePrice(tariff: Tariff, chargedWeight: number): number {
    return tariff.pricePerKg * chargedWeight;
  }

  static validateQuotationData(data: any): QuotationRequestDto {
    const { weight, length, width, height, origin, destination } = data;

    if (!weight || !length || !width || !height || !origin || !destination) {
      throw createError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
    }

    if (weight <= 0) {
      throw createError(ERROR_MESSAGES.VALIDATION.INVALID_WEIGHT, HTTP_STATUS.BAD_REQUEST);
    }

    if (length <= 0 || width <= 0 || height <= 0) {
      throw createError(ERROR_MESSAGES.VALIDATION.INVALID_DIMENSIONS, HTTP_STATUS.BAD_REQUEST);
    }

    return {
      weight,
      length,
      width,
      height,
      origin,
      destination,
    };
  }

  static async getQuotation(
    weight: number,
    length: number,
    width: number,
    height: number,
    origin: string,
    destination: string
  ): Promise<QuotationResponseDto> {
    const quotationData = this.validateQuotationData({
      weight,
      length,
      width,
      height,
      origin,
      destination,
    });

    const volumeWeight = this.calculateVolumeWeight(length, width, height);
    const selectedWeight = this.calculateChargedWeight(weight, volumeWeight);

    const tariff = await QuotationRepository.findByOriginDestination(origin, destination);

    if (!tariff) {
      throw createError(ERROR_MESSAGES.VALIDATION.TARIFF_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }

    const price = this.calculatePrice(tariff, selectedWeight);

    return {
      price,
      volumeWeight,
      selectedWeight,
      origin,
      destination,
      pricePerKg: tariff.pricePerKg,
    };
  }

  static async getAllTariffs(): Promise<Tariff[]> {
    return await QuotationRepository.getAllTariffs();
  }
  
}
