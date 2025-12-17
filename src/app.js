// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_PROD_URL
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const authRoutes = require('./routes/auth');
const marcacionesRoutes = require('./routes/marcaciones');
const empleadorRoutes = require('./routes/empleador');
const establecimientosRoutes = require('./routes/establecimientos');
const fiscalizacionRoutes = require('./routes/fiscalizacion');

app.use('/api/auth', authRoutes);
app.use('/api/marcaciones', marcacionesRoutes);
app.use('/api/empleador', empleadorRoutes);
app.use('/api/establecimientos', establecimientosRoutes);
app.use('/api/fiscalizacion', fiscalizacionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Sistema de Asistencia v1.0' 
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});