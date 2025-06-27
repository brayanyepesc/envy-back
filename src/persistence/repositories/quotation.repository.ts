import { getConnection } from "../../config/database";
import { Tariff } from "../../domain/interfaces/tariff.interface";

export class QuotationRepository {
  static async findByOriginDestination(
    origin: string,
    destination: string
  ): Promise<Tariff | null> {
    const [rows] = await getConnection().execute(
      "SELECT * FROM tariffs WHERE origin = ? AND destination = ?",
      [origin, destination]
    );
    const tariffs = rows as Tariff[];
    return tariffs[0] || null;
  }
}
