-- Tabla: usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(50) NOT NULL,
  apellido_materno VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) NOT NULL DEFAULT 'trabajador',
  regimen_especial BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  empleador_id UUID REFERENCES empleadores(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: empleadores
CREATE TABLE empleadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rut VARCHAR(12) UNIQUE NOT NULL,
  razon_social VARCHAR(200) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: marcaciones
CREATE TABLE marcaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  empleador_id UUID NOT NULL REFERENCES empleadores(id),
  tipo_marcacion VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  ubicacion TEXT,
  hash VARCHAR(64) UNIQUE NOT NULL,
  sincronizado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: establecimientos
CREATE TABLE establecimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleador_id UUID NOT NULL REFERENCES empleadores(id),
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT,
  comuna VARCHAR(50),
  region VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE
);

-- Índices
CREATE INDEX idx_marcaciones_usuario ON marcaciones(usuario_id);
CREATE INDEX idx_marcaciones_timestamp ON marcaciones(timestamp);
CREATE INDEX idx_marcaciones_hash ON marcaciones(hash);
CREATE INDEX idx_usuarios_rut ON usuarios(rut);