const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de passport DESPUÉS de cargar dotenv
const passport = require('./config/passport');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const boatsRoutes = require('./routes/boatsRoutes');
const validationRoutes = require('./routes/validationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const geoapifyRoutes = require('./routes/geoapifyRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración CORS basada en variables de entorno
// Permite una lista explícita (JSON o separada por comas) y/o un REGEX opcional
function parseOrigins(input) {
  if (!input) return [];
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {
    // no-op, intentar como lista separada por comas
  }
  return String(input)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const ALLOWED_ORIGINS = [
  ...parseOrigins(process.env.CORS_ORIGINS),
  // Valores útiles por defecto en desarrollo
  'http://localhost:5173', // Vite
  'http://localhost:3000',
];

const ORIGIN_REGEX = process.env.CORS_ORIGIN_REGEX
  ? new RegExp(process.env.CORS_ORIGIN_REGEX)
  : /https:\/\/.*\.onrender\.com$/; // por defecto: permitir previews de Render

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin "origin" (por ejemplo, herramientas CLI o SSR)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin) || ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight
app.use(express.json());

// Middleware para mostrar todas las peticiones HTTP
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  const method = req.method;
  const url = req.originalUrl;
  
  console.log(`🔔 [${timestamp}] ${method} ${url}`);
  
  next();
});

// Inicializar Passport (solo para OAuth, sin sesiones)
app.use(passport.initialize());

// Conexión a MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ Conectado a MongoDB Atlas');
    console.log('🌐 CORS origins permitidos:', ALLOWED_ORIGINS);
    console.log('🔢 CORS regex:', ORIGIN_REGEX);
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

// Rutas para barcos reales
app.use('/api/boats', boatsRoutes);

// Placeholders (mover o eliminar cuando se implementen completamente)
app.get('/api/boats-placeholder', (req, res) => {
  res.json({ message: 'Endpoint placeholder para obtener barcos' });
});

app.get('/api/boats-placeholder/:id', (req, res) => {
  res.json({ message: `Endpoint placeholder para obtener barco con ID: ${req.params.id}` });
});

// Usar rutas de usuarios
app.use('/api/users', userRoutes);

// Usar rutas de autenticación
app.use('/api/auth', authRoutes);

// Validación de perfil (licencias)
app.use('/api/validation', validationRoutes);

// Rutas de administración
app.use('/api/admin', adminRoutes);

// Proxy Geoapify (oculta API key y permite caching futuro)
app.use('/api/geoapify', geoapifyRoutes);

// Rutas de reservas
app.use('/api/bookings', bookingsRoutes);

// Rutas de mensajes (contacto con propietario)
app.use('/api/messages', messagesRoutes);

// Rutas de favoritos
app.use('/api/favorites', favoritesRoutes);

// Rutas de reseñas
app.use('/api/reviews', reviewsRoutes);

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
