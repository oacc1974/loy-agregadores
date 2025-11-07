console.log('📦 Cargando app.js...');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

console.log('📦 Cargando logger...');
const logger = require('./utils/logger');

console.log('📦 Cargando error middleware...');
const errorMiddleware = require('./middleware/error.middleware');

// Importar rutas
console.log('📦 Cargando rutas...');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const aggregatorRoutes = require('./routes/aggregator.routes');
const uberRoutes = require('./routes/uber.routes');
const loyverseRoutes = require('./routes/loyverse.routes');
const syncRoutes = require('./routes/sync.routes');
console.log('✅ Rutas cargadas exitosamente');

const app = express();
console.log('✅ Express app creada');

// Configurar Passport
console.log('📦 Configurando Passport...');
try {
  require('./config/passport');
  console.log('✅ Passport configurado');
} catch (error) {
  console.error('❌ Error configurando Passport:', error.message);
  throw error;
}

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Logger de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'Loy-Agregadores API',
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/aggregators', aggregatorRoutes);
app.use('/api/uber', uberRoutes);
app.use('/api/loyverse', loyverseRoutes);
app.use('/api/sync', syncRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores
app.use(errorMiddleware);

module.exports = app;
