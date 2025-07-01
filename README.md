# Envy Backend

Sistema backend para la gestión de cotización, generación y rastreo de envíos en tiempo real para una empresa de logística.  

---

## Tabla de Contenidos

- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura](#arquitectura)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints Principales](#endpoints-principales)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Cotización y Envíos](#cotización-y-envíos)
- [Seguimiento en Tiempo Real](#seguimiento-en-tiempo-real)
- [Pruebas](#pruebas)
- [Documentación Swagger](#documentación-swagger)
- [Consideraciones Técnicas](#consideraciones-técnicas)
- [Notas Finales](#notas-finales)

---

## Tecnologías Utilizadas

- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Base de datos:** MySQL o PostgreSQL (configurable)
- **Cache:** Redis
- **Autenticación:** JWT (JSON Web Token)
- **Documentación:** Swagger
- **Pruebas:** Jest (unitarias e integración)
- **Arquitectura:** Clean Architecture

---

## Arquitectura

El proyecto sigue los principios de Clean Architecture, separando responsabilidades en capas:

- **Domain:** Definición de entidades, interfaces y DTOs.
- **Application:** Lógica de negocio y servicios.
- **Infrastructure:** Middlewares, rutas, integración con frameworks y servicios externos.
- **Persistence:** Repositorios para acceso a datos.
- **Config:** Configuración de base de datos, Redis, Swagger, etc.

---

## Instalación y Configuración

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd envy-back
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto con la siguiente información (ajusta según tu entorno):

   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=usuario
   DB_PASSWORD=contraseña
   DB_NAME=envy_db
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=tu_clave_secreta
   ```

4. **Configura la base de datos:**
   - Crea la base de datos y las tablas necesarias (ver scripts o migraciones si están disponibles).
   - Asegúrate de que Redis esté corriendo.

---

## Ejecución

- **Modo desarrollo:**
  ```bash
  npm run dev
  ```

- **Modo producción:**
  ```bash
  npm run build
  npm start
  ```

---

## Estructura del Proyecto

```
src/
  application/         # Servicios de negocio
  config/              # Configuración de BD, Redis, Swagger, etc.
  domain/              # Entidades, DTOs, interfaces
  infraestructure/     # Middlewares, rutas
  persistence/         # Repositorios de datos
  shared/              # Utilidades compartidas
  tests/               # Pruebas unitarias e integración
```

---

## Endpoints Principales

### Autenticación

- `POST /api/auth/register`  
  Registro de usuario.  
  **Body:** `{ nombre, email, password }`

- `POST /api/auth/login`  
  Login de usuario.  
  **Body:** `{ email, password }`  
  **Respuesta:** `{ token }` (JWT)

### Cotización

- `POST /api/quotation`  
  Cotiza el valor de un envío.  
  **Body:** `{ peso, alto, ancho, largo, origen, destino }`  
  **Respuesta:** `{ valorCotizado }`

### Envíos

- `POST /api/shipment`  
  Crea un nuevo envío cotizado.  
  **Body:** `{ peso, alto, ancho, largo, origen, destino, valorCotizado }`  
  **Respuesta:** `{ idEnvio, estado: "En espera" }`

- `GET /api/shipment/:id`  
  Consulta el estado actual de un envío por ID.

### Seguimiento en Tiempo Real

- **WebSocket o Polling:**  
  Permite recibir actualizaciones del estado del envío en tiempo real.  
  (Ver detalles en la documentación Swagger)

---

## Autenticación y Seguridad

- Todos los endpoints protegidos requieren un token JWT en el header `Authorization: Bearer <token>`.
- El sistema valida credenciales y protege rutas sensibles.
- Las contraseñas se almacenan de forma segura (hash).

---

## Cotización y Envíos

- La cotización se realiza usando el mayor valor entre el peso real y el peso volumétrico:  
  `peso_volumetrico = ceil((alto * ancho * largo) / 2500)`
- El valor del envío se obtiene de la tabla de tarifas según origen, destino y peso.
- El estado inicial de cada envío es "En espera" y se actualiza conforme avanza:  
  `En espera → En tránsito → Entregado`

---

## Seguimiento en Tiempo Real

- El usuario puede consultar el estado de sus envíos en tiempo real.
- Se implementa mediante WebSockets o polling (según configuración).
- Se mantiene un histórico de los estados del envío.

---

## Pruebas

- Las pruebas unitarias y de integración se encuentran en `src/tests/`.
- Para ejecutar las pruebas:
  ```bash
  npm test
  ```

---

## Documentación Swagger

- La documentación interactiva de la API está disponible en:  
  `http://localhost:3000/api/docs`  
  (Ajusta el puerto según tu configuración)
- Incluye ejemplos de request/response y descripciones de cada endpoint.

---

## Consideraciones Técnicas

- **Eficiencia:**  
  Uso de Redis para cachear consultas frecuentes y mejorar el rendimiento.
- **Escalabilidad:**  
  Arquitectura desacoplada y preparada para crecimiento.
- **Seguridad:**  
  JWT, validación de datos y manejo seguro de contraseñas.
- **Código Limpio:**  
  Principios SOLID y buenas prácticas de desarrollo.

---

## Notas Finales

- Este backend está listo para integrarse con un frontend en React (microfrontends, JWT, Material-UI, etc.).
- Para cualquier duda, consulta la documentación Swagger o el código fuente.
- Recuerda ajustar las variables de entorno y la configuración de la base de datos/Redis según tu entorno local o de producción. 