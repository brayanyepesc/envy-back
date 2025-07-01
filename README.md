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
- [Inicialización de la Base de Datos](#inicialización-de-la-base-de-datos)

---

## Tecnologías Utilizadas

- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Base de datos:** MySQL (configurable)
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
   REDIS_URL=
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

- **Polling:**  
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
- Se implementa mediante polling (según configuración).
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

- Para cualquier duda, consulta la documentación Swagger o el código fuente.
- Recuerda ajustar las variables de entorno y la configuración de la base de datos/Redis según tu entorno local o de producción. 

---

## Inicialización de la Base de Datos

Para que el backend funcione correctamente, es necesario crear las tablas y poblar la tabla de tarifas en la base de datos MySQL. A continuación se describen los pasos y el orden recomendado para ejecutar los scripts SQL:

### 1. Crear las tablas

Ejecuta los siguientes scripts en tu base de datos MySQL, en este orden:

1. **Tabla de usuarios**
    ```sql
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombres VARCHAR(100) NOT NULL,
      apellidos VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      ciudad VARCHAR(100) NOT NULL,
      nickname VARCHAR(100) NOT NULL UNIQUE
    );
    ```

2. **Tabla de envíos**
    ```sql
    CREATE TABLE IF NOT EXISTS shipments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      package_weight DECIMAL(10,2) NOT NULL,
      package_length DECIMAL(10,2) NOT NULL,
      package_width DECIMAL(10,2) NOT NULL,
      package_height DECIMAL(10,2) NOT NULL,
      quoted_price DECIMAL(10,2) NOT NULL,
      status ENUM('waiting', 'in_transit', 'delivered') DEFAULT 'waiting',
      tracking_number VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_tracking_number (tracking_number),
      INDEX idx_status (status)
    );
    ```

3. **Tabla de historial de estados de envío**
    ```sql
    CREATE TABLE IF NOT EXISTS shipment_status_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      shipment_id INT NOT NULL,
      status ENUM('waiting', 'in_transit', 'delivered') NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
      INDEX idx_shipment_id (shipment_id),
      INDEX idx_created_at (created_at)
    );
    ```

4. **Tabla de tarifas**
    ```sql
    CREATE TABLE tariffs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      price_per_kg DECIMAL(10,2) NOT NULL
    );
    ```

### 2. Poblar la tabla de tarifas

Después de crear la tabla `tariffs`, inserta los valores iniciales con el siguiente script:

```sql
INSERT INTO tariffs (origin, destination, price_per_kg)
VALUES
('Bogotá', 'Medellín', 5000),
('Bogotá', 'Cali', 5500),
('Bogotá', 'Barranquilla', 6000),
('Bogotá', 'Cartagena', 6200),
('Medellín', 'Bogotá', 5000),
('Medellín', 'Cali', 5200),
('Medellín', 'Barranquilla', 5800),
('Medellín', 'Cartagena', 6000),
('Cali', 'Bogotá', 5500),
('Cali', 'Medellín', 5200),
('Cali', 'Barranquilla', 5900),
('Cali', 'Cartagena', 6100),
('Barranquilla', 'Bogotá', 6000),
('Barranquilla', 'Medellín', 5800),
('Barranquilla', 'Cali', 5900),
('Barranquilla', 'Cartagena', 4000),
('Cartagena', 'Bogotá', 6200),
('Cartagena', 'Medellín', 6000),
('Cartagena', 'Cali', 6100),
('Cartagena', 'Barranquilla', 4000);
```

---

**Recomendaciones:**
- Puedes ejecutar estos scripts usando un cliente MySQL como MySQL Workbench, DBeaver, phpMyAdmin o desde la terminal.
- Asegúrate de tener creada la base de datos (`CREATE DATABASE envy;`) y seleccionada antes de ejecutar los scripts (`USE envy;`).
- Si necesitas modificar los nombres de las tablas o campos, asegúrate de actualizar también el código fuente correspondiente. 