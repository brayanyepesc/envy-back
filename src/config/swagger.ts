import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Envy Back API',
      version: '1.0.0',
      description: 'API para gestión de envíos y cotizaciones',
      contact: {
        name: 'Soporte API',
        email: 'soporte@envy.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Esquemas de autenticación
        RegisterDto: {
          type: 'object',
          required: ['nickname', 'names', 'lastnames', 'email', 'password', 'city'],
          properties: {
            nickname: {
              type: 'string',
              description: 'Apodo del usuario',
              example: 'juan_perez'
            },
            names: {
              type: 'string',
              description: 'Nombres del usuario',
              example: 'Juan Carlos'
            },
            lastnames: {
              type: 'string',
              description: 'Apellidos del usuario',
              example: 'Pérez González'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan.perez@ejemplo.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario',
              example: '123456'
            },
            city: {
              type: 'string',
              description: 'Ciudad del usuario',
              example: 'Buenos Aires'
            }
          }
        },
        LoginDto: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan.perez@ejemplo.com'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
              example: '123456'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nickname: {
              type: 'string',
              example: 'juan_perez'
            },
            names: {
              type: 'string',
              example: 'Juan Carlos'
            },
            lastnames: {
              type: 'string',
              example: 'Pérez González'
            },
            email: {
              type: 'string',
              example: 'juan.perez@ejemplo.com'
            },
            city: {
              type: 'string',
              example: 'Buenos Aires'
            }
          }
        },
        // Esquemas de cotización
        QuotationRequestDto: {
          type: 'object',
          required: ['weight', 'length', 'width', 'height', 'origin', 'destination'],
          properties: {
            weight: {
              type: 'number',
              description: 'Peso del paquete en kg',
              example: 2.5
            },
            length: {
              type: 'number',
              description: 'Largo del paquete en cm',
              example: 30
            },
            width: {
              type: 'number',
              description: 'Ancho del paquete en cm',
              example: 20
            },
            height: {
              type: 'number',
              description: 'Alto del paquete en cm',
              example: 15
            },
            origin: {
              type: 'string',
              description: 'Ciudad de origen',
              example: 'Buenos Aires'
            },
            destination: {
              type: 'string',
              description: 'Ciudad de destino',
              example: 'Córdoba'
            }
          }
        },
        QuotationResponseDto: {
          type: 'object',
          properties: {
            price: {
              type: 'number',
              description: 'Precio total del envío',
              example: 1500.50
            },
            volumeWeight: {
              type: 'number',
              description: 'Peso volumétrico calculado',
              example: 2.25
            },
            selectedWeight: {
              type: 'number',
              description: 'Peso seleccionado para el cálculo',
              example: 2.5
            },
            origin: {
              type: 'string',
              example: 'Buenos Aires'
            },
            destination: {
              type: 'string',
              example: 'Córdoba'
            },
            pricePerKg: {
              type: 'number',
              description: 'Precio por kilogramo',
              example: 200.00
            }
          }
        },
        TariffDto: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            origin: {
              type: 'string',
              example: 'Buenos Aires'
            },
            destination: {
              type: 'string',
              example: 'Córdoba'
            },
            pricePerKg: {
              type: 'number',
              example: 200.00
            }
          }
        },
        // Esquemas de envíos
        CreateShipmentRequestDto: {
          type: 'object',
          required: ['origin', 'destination', 'weight', 'length', 'width', 'height', 'quotedPrice'],
          properties: {
            origin: {
              type: 'string',
              description: 'Ciudad de origen',
              example: 'Buenos Aires'
            },
            destination: {
              type: 'string',
              description: 'Ciudad de destino',
              example: 'Córdoba'
            },
            weight: {
              type: 'number',
              description: 'Peso del paquete en kg',
              example: 2.5
            },
            length: {
              type: 'number',
              description: 'Largo del paquete en cm',
              example: 30
            },
            width: {
              type: 'number',
              description: 'Ancho del paquete en cm',
              example: 20
            },
            height: {
              type: 'number',
              description: 'Alto del paquete en cm',
              example: 15
            },
            quotedPrice: {
              type: 'number',
              description: 'Precio cotizado del envío',
              example: 1500.50
            }
          }
        },
        CreateShipmentResponseDto: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            trackingNumber: {
              type: 'string',
              example: 'ENV2024001'
            },
            status: {
              type: 'string',
              example: 'waiting'
            },
            message: {
              type: 'string',
              example: 'Envío creado exitosamente'
            }
          }
        },
        ShipmentDetailsResponseDto: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            trackingNumber: {
              type: 'string',
              example: 'ENV2024001'
            },
            status: {
              type: 'string',
              enum: ['waiting', 'in_transit', 'delivered'],
              example: 'waiting'
            },
            origin: {
              type: 'string',
              example: 'Buenos Aires'
            },
            destination: {
              type: 'string',
              example: 'Córdoba'
            },
            package: {
              type: 'object',
              properties: {
                weight: {
                  type: 'number',
                  example: 2.5
                },
                length: {
                  type: 'number',
                  example: 30
                },
                width: {
                  type: 'number',
                  example: 20
                },
                height: {
                  type: 'number',
                  example: 15
                }
              }
            },
            quotedPrice: {
              type: 'number',
              example: 1500.50
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        TrackingResponseDto: {
          type: 'object',
          properties: {
            shipmentId: {
              type: 'integer',
              example: 1
            },
            trackingNumber: {
              type: 'string',
              example: 'ENV2024001'
            },
            currentStatus: {
              type: 'string',
              enum: ['waiting', 'in_transit', 'delivered'],
              example: 'in_transit'
            },
            history: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'in_transit'
                  },
                  description: {
                    type: 'string',
                    example: 'Paquete en tránsito hacia destino'
                  },
                  location: {
                    type: 'string',
                    example: 'Centro de distribución Córdoba'
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-16T14:30:00Z'
                  }
                }
              }
            }
          }
        },
        // Esquemas de respuesta estándar
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/infraestructure/routes/*.ts',
    './src/domain/dto/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi }; 