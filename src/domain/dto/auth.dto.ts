export interface RegisterDto {
  nickname: string;
  names: string;
  lastnames: string;
  email: string;
  password: string;
  city: string;
  phone: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
} 