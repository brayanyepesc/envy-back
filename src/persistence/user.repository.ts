import { getConnection } from "../config/database";
import { User } from "../domain/user.interface";

export class UserRepository {

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await getConnection().execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const users = rows as User[];
    return users[0] || null;
  }

  static async create(user: Omit<User, "id">): Promise<void> {
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
  }
  
}
