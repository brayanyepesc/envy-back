import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../persistence/repositories/user.repository";
import { RegisterDto, LoginDto } from "../../domain/dto/auth.dto";
import { User } from "../../domain/interfaces/user.interface";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { RedisCache } from "../../config/redis";
import {
  APP_CONFIG,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../../config/constants";

export class AuthService {
  static async register(userData: RegisterDto): Promise<void> {
    const existingUser = await UserRepository.findByEmail(userData.email);

    if (existingUser) {
      throw createError(ERROR_MESSAGES.AUTH.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      APP_CONFIG.SALT_ROUNDS
    );

    await UserRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  static async login(
    credentials: LoginDto
  ): Promise<{ token: string; user: Omit<User, "password" | "id"> }> {
    const user = await UserRepository.findByEmail(credentials.email);

    if (!user) {
      throw createError(
        ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      throw createError(
        ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const token = jwt.sign({ id: user.id }, APP_CONFIG.JWT_SECRET, {
      expiresIn: APP_CONFIG.JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        nickname: user.nickname,
        names: user.names,
        lastnames: user.lastnames,
        email: user.email,
        city: user.city,
      },
    };
  }

  static validateRegisterData(data: any): RegisterDto {
    const { nickname, names, lastnames, email, password, city } = data;

    if (!nickname || !names || !lastnames || !email || !password || !city) {
      throw createError(
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (password.length < APP_CONFIG.PASSWORD_MIN_LENGTH) {
      throw createError(
        ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!this.isValidEmail(email)) {
      throw createError(
        ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return { nickname, names, lastnames, email, password, city };
  }

  static validateLoginData(data: any): LoginDto {
    const { email, password } = data;

    if (!email || !password) {
      throw createError(
        ERROR_MESSAGES.VALIDATION.EMAIL_PASSWORD_REQUIRED,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!this.isValidEmail(email)) {
      throw createError(
        ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return { email, password };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async logout(token: string, userId: number): Promise<void> {
    try {
      // Agregar el token a la blacklist en Redis
      await RedisCache.addToBlacklist(token, userId);
    } catch (error) {
      console.error("Error al hacer logout:", error);
      // No lanzar error para no afectar la experiencia del usuario
    }
  }
}
