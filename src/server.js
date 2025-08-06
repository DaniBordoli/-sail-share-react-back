const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    message: 'SailShare API funcionando',
    status: 'OK'
  });
});

// Rutas para barcos
app.get('/api/boats', (req, res) => {
  res.json({ message: 'Endpoint para obtener barcos' });
});

app.get('/api/boats/:id', (req, res) => {
  res.json({ message: `Endpoint para obtener barco con ID: ${req.params.id}` });
});

// Usar rutas de usuarios
app.use('/api/users', userRoutes);

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📄 API Documentation: http://localhost:${PORT}/api`);
  });
};

startServer();
