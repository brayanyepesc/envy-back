import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../persistence/repositories/user.repository";
import { RegisterDto, LoginDto } from "../../domain/dto/auth.dto";
import { User } from "../../domain/interfaces/user.interface";
import { createError } from "../../infraestructure/middlewares/error.middleware";
import { APP_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../../config/constants";

export class AuthService {
  static async register(userData: RegisterDto): Promise<void> {

    const existingUser = await UserRepository.findByEmail(userData.email);

    if (existingUser) {
      throw createError(ERROR_MESSAGES.AUTH.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(userData.password, APP_CONFIG.SALT_ROUNDS);
    
    await UserRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  static async login(credentials: LoginDto): Promise<string> {

    const user = await UserRepository.findByEmail(credentials.email);

    if (!user) {
      throw createError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);

    if (!isValidPassword) {
      throw createError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    return jwt.sign(
      { id: user.id },
      APP_CONFIG.JWT_SECRET,
      { expiresIn: APP_CONFIG.JWT_EXPIRES_IN }
    );

  }

  static validateRegisterData(data: any): RegisterDto {

    const { nickname, names, lastnames, email, password, city, phone } = data;
    
    if (!nickname || !names || !lastnames || !email || !password || !city || !phone) {
      throw createError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
    }

    if (password.length < APP_CONFIG.PASSWORD_MIN_LENGTH) {
      throw createError(ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT, HTTP_STATUS.BAD_REQUEST);
    }

    if (!this.isValidEmail(email)) {
      throw createError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL, HTTP_STATUS.BAD_REQUEST);
    }

    return { nickname, names, lastnames, email, password, city, phone };

  }

  static validateLoginData(data: any): LoginDto {

    const { email, password } = data;
    
    if (!email || !password) {
      throw createError(ERROR_MESSAGES.VALIDATION.EMAIL_PASSWORD_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    if (!this.isValidEmail(email)) {
      throw createError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL, HTTP_STATUS.BAD_REQUEST);
    }

    return { email, password };
    
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 