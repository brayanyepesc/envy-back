import { getConnection } from "../../config/database";
import { Tariff } from "../../domain/interfaces/tariff.interface";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../config/constants";

export class QuotationRepository {
  static async findByOriginDestination(
    origin: string,
    destination: string
  ): Promise<Tariff | null> {
    try {
      const [rows] = await getConnection().execute(
        "SELECT id, origin, destination, price_per_kg as pricePerKg FROM tariffs WHERE origin = ? AND destination = ?",
        [origin, destination]
      );
      const tariffs = rows as Tariff[];
      return tariffs[0] || null;
    } catch (error) {
      console.error("Error al buscar tarifa:", error);
      throw createError(ERROR_MESSAGES.DATABASE.TARIFF_FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async getAllTariffs(): Promise<Tariff[]> {
    try {
      const [rows] = await getConnection().execute(
        "SELECT id, origin, destination, price_per_kg as pricePerKg FROM tariffs ORDER BY origin, destination"
      );
      return rows as Tariff[];
    } catch (error) {
      console.error("Error al obtener todas las tarifas:", error);
      throw createError(ERROR_MESSAGES.DATABASE.TARIFF_FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
