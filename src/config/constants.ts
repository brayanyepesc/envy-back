export const APP_CONFIG = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: '15m',
  SALT_ROUNDS: 10,
  PASSWORD_MIN_LENGTH: 6,
  VOLUME_WEIGHT_DIVISOR: 2500, 
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELDS: "Todos los campos son obligatorios",
    INVALID_EMAIL: "Formato de email inválido",
    PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 6 caracteres",
    EMAIL_PASSWORD_REQUIRED: "Email y contraseña son obligatorios",
    INVALID_WEIGHT: "El peso debe ser mayor a 0",
    INVALID_DIMENSIONS: "Las dimensiones deben ser mayores a 0",
    INVALID_ORIGIN_DESTINATION: "Origen y destino son obligatorios",
    TARIFF_NOT_FOUND: "Tarifa no encontrada para la ruta especificada",
  },
  AUTH: {
    EMAIL_EXISTS: "Email ya registrado",
    INVALID_CREDENTIALS: "Credenciales inválidas",
  },
  DATABASE: {
    USER_NOT_FOUND: "Usuario no encontrado",
    CREATE_ERROR: "Error al crear usuario",
    FIND_ERROR: "Error al buscar usuario",
    TARIFF_NOT_FOUND: "Tarifa no encontrada",
    TARIFF_FIND_ERROR: "Error al buscar tarifa",
  },
} as const; 