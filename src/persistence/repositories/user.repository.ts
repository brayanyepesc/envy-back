import { getConnection } from "../../config/database";
import { User } from "../../domain/interfaces/user.interface";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../config/constants";

export class UserRepository {

  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await getConnection().execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      const users = rows as User[];
      return users[0] || null;
    } catch (error) {
      console.error("Error al buscar el usuario por email:", error);
      throw createError(ERROR_MESSAGES.DATABASE.FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async create(user: Omit<User, "id">): Promise<void> {
    try {
      await getConnection().execute(
        `INSERT INTO users 
        (nickname, names, lastnames, email, password, city, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.nickname,
          user.names,
          user.lastnames,
          user.email,
          user.password,
          user.city,
          user.phone,
        ]
      );
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      throw createError(ERROR_MESSAGES.DATABASE.CREATE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await getConnection().execute(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      const users = rows as User[];
      return users[0] || null;
    } catch (error) {
      console.error("Error al buscar el usuario por id:", error);
      throw createError(ERROR_MESSAGES.DATABASE.FIND_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
