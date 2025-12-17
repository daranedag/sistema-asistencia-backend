# Sistema de Asistencia - API Backend

API REST para sistema de control de asistencia laboral con marcaciones verificables mediante hash criptográfico.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 📋 Variables de Entorno

Ver archivo `.env.example` para la configuración completa.

## 🔐 Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

## 📚 Endpoints

### AUTH - Autenticación

#### `POST /api/auth/login`
Login con RUT y contraseña.

**Body:**
```json
{
  "rut": "12345678-9",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id": "uuid",
      "rut": "12345678-9",
      "nombres": "Juan",
      "apellido_paterno": "Pérez",
      "apellido_materno": "González",
      "email": "juan@example.com",
      "rol": "trabajador",
      "empleador": { ... }
    }
  }
}
```

#### `POST /api/auth/register`
Registro de nuevo trabajador.

**Body:**
```json
{
  "rut": "12345678-9",
  "nombres": "Juan",
  "apellido_paterno": "Pérez",
  "apellido_materno": "González",
  "email": "juan@example.com",
  "password": "contraseña123",
  "telefono": "+56912345678",
  "empleador_id": "uuid-del-empleador"
}
```

#### `POST /api/auth/logout`
Cerrar sesión (requiere autenticación).

#### `PUT /api/auth/change-password`
Cambiar contraseña (requiere autenticación).

**Body:**
```json
{
  "password_actual": "contraseña123",
  "password_nueva": "nuevaContraseña456"
}
```

---

### MARCACIONES - Control de Asistencia

#### `POST /api/marcaciones`
Crear una nueva marcación (requiere autenticación de trabajador).

**Body:**
```json
{
  "tipo_marcacion": "entrada",
  "ubicacion": "Oficina Central, Santiago"
}
```

**Tipos de marcación:** `entrada`, `salida`, `entrada_almuerzo`, `salida_almuerzo`

**Respuesta:**
```json
{
  "success": true,
  "message": "Marcación registrada exitosamente",
  "data": {
    "id": "uuid",
    "tipo_marcacion": "entrada",
    "timestamp": "2025-12-17T10:30:00.000Z",
    "ubicacion": "Oficina Central, Santiago",
    "hash": "a1b2c3d4e5f6..."
  }
}
```

#### `GET /api/marcaciones/mis-marcaciones`
Obtener todas las marcaciones del usuario autenticado.

**Query params (opcionales):**
- `desde`: Fecha inicial (ISO 8601)
- `hasta`: Fecha final (ISO 8601)

**Ejemplo:** `/api/marcaciones/mis-marcaciones?desde=2025-12-01&hasta=2025-12-31`

#### `GET /api/marcaciones/ultima`
Obtener la última marcación del usuario autenticado.

#### `POST /api/marcaciones/verificar`
Verificar autenticidad de una marcación mediante hash (público, sin autenticación).

**Body:**
```json
{
  "hash": "a1b2c3d4e5f6..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "valido": true,
    "marcacion": {
      "tipo_marcacion": "entrada",
      "timestamp": "2025-12-17T10:30:00.000Z",
      "trabajador": {
        "rut": "12345678-9",
        "nombre": "Juan Pérez González"
      },
      "empleador": {
        "rut": "76543210-K",
        "razon_social": "Empresa S.A."
      }
    }
  }
}
```

---

### EMPLEADOR - Gestión de Empleadores

#### `GET /api/empleador/marcaciones`
Obtener todas las marcaciones de los trabajadores del empleador (requiere rol empleador).

**Query params (opcionales):**
- `desde`: Fecha inicial
- `hasta`: Fecha final

#### `GET /api/empleador/trabajadores`
Listar todos los trabajadores del empleador (requiere rol empleador).

#### `POST /api/empleador/trabajadores`
Crear un nuevo trabajador (requiere rol empleador).

**Body:**
```json
{
  "rut": "98765432-1",
  "nombres": "María",
  "apellido_paterno": "López",
  "apellido_materno": "Silva",
  "email": "maria@example.com",
  "password": "contraseña123",
  "telefono": "+56987654321",
  "regimen_especial": false
}
```

#### `PUT /api/empleador/trabajadores/:id`
Editar datos de un trabajador (requiere rol empleador).

**Body (todos opcionales):**
```json
{
  "nombres": "María José",
  "email": "maria.nuevo@example.com",
  "telefono": "+56912345678",
  "regimen_especial": true
}
```

#### `DELETE /api/empleador/trabajadores/:id`
Desactivar un trabajador (requiere rol empleador).

#### `GET /api/empleador/estadisticas`
Obtener estadísticas del dashboard (requiere rol empleador).

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_trabajadores": 50,
    "trabajadores_activos_hoy": 45,
    "marcaciones_hoy": 90,
    "marcaciones_mes": 2500
  }
}
```

---

### ESTABLECIMIENTOS - Gestión de Sucursales

#### `GET /api/establecimientos`
Listar establecimientos del empleador (requiere rol empleador).

#### `POST /api/establecimientos`
Crear un nuevo establecimiento (requiere rol empleador).

**Body:**
```json
{
  "nombre": "Sucursal Santiago Centro",
  "direccion": "Av. Libertador Bernardo O'Higgins 1234",
  "comuna": "Santiago",
  "region": "Metropolitana"
}
```

---

### FISCALIZACIÓN - Dirección del Trabajo

#### `GET /api/fiscalizacion/marcaciones`
Consultar marcaciones para fiscalización (requiere rol fiscalizador).

**Query params (opcionales):**
- `empleador_id`: UUID del empleador
- `desde`: Fecha inicial
- `hasta`: Fecha final

#### `GET /api/fiscalizacion/trabajador/:rut`
Obtener historial completo de marcaciones de un trabajador por RUT (requiere rol fiscalizador).

**Query params (opcionales):**
- `desde`: Fecha inicial
- `hasta`: Fecha final

**Ejemplo:** `/api/fiscalizacion/trabajador/12345678-9?desde=2025-01-01&hasta=2025-12-31`

---

## 🔒 Roles de Usuario

- **`trabajador`**: Puede crear marcaciones y ver su propio historial
- **`empleador`**: Puede gestionar trabajadores, ver todas las marcaciones y estadísticas
- **`fiscalizador`**: Puede consultar marcaciones de cualquier empleador/trabajador

## 📊 Base de Datos

La aplicación utiliza PostgreSQL a través de Supabase. Ver `baseDatos.sql` para el esquema completo.

### Tablas principales:
- `usuarios`: Trabajadores y empleadores
- `empleadores`: Empresas
- `marcaciones`: Registros de asistencia con hash verificable
- `establecimientos`: Sucursales de las empresas

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración de 24 horas
- Hash SHA-256 para verificación de marcaciones
- Validación de datos con express-validator

## 📧 Notificaciones

Se envía un comprobante por email automáticamente al registrar cada marcación, incluyendo el hash de verificación.

## 🛠️ Tecnologías

- Node.js + Express
- PostgreSQL (Supabase)
- JWT para autenticación
- Bcrypt para hash de contraseñas
- Nodemailer para emails
- Express-validator para validaciones

## 📝 Notas

- Todos los timestamps están en formato ISO 8601 (UTC)
- Los RUTs deben incluir el guión: `12345678-9`
- El hash de marcación es único e inmutable, garantizando la integridad del registro
