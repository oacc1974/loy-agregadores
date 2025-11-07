require('dotenv').config();

// Log inicial para debug
console.log('🔧 Iniciando servidor...');
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 PORT:', process.env.PORT || 5000);
console.log('📍 MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada ✅' : 'NO CONFIGURADA ❌');

try {
  console.log('📦 Cargando módulos principales...');
  const app = require('./src/app');
  console.log('✅ App cargada');
  
  const connectDB = require('./src/config/database');
  console.log('✅ Database config cargada');
  
  const logger = require('./src/utils/logger');
  console.log('✅ Logger cargado');
} catch (error) {
  console.error('❌ Error fatal al cargar módulos:', error);
  process.exit(1);
}

const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando proceso de arranque...');
    
    // Conectar a MongoDB primero
    console.log('📦 Llamando a connectDB()...');
    await connectDB();
    console.log('✅ connectDB() completado');
    
    // Iniciar servidor después de conectar a MongoDB
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV}`);
      logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
    });

    return server;
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    logger.error('❌ Error al iniciar el servidor:', error);
    console.error('❌ Stack trace:', error.stack);
    process.exit(1);
  }
};

// Iniciar el servidor
console.log('📦 Ejecutando startServer()...');
let server;
startServer()
  .then(s => {
    server = s;
    console.log('✅ startServer() completado exitosamente');
  })
  .catch(err => {
    console.error('❌ startServer() falló:', err);
    console.error('❌ Stack:', err.stack);
    process.exit(1);
  });

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM recibido, cerrando servidor...');
  if (server) {
    server.close(() => {
      logger.info('✅ Servidor cerrado');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
