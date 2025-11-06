require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB primero
    await connectDB();
    
    // Iniciar servidor después de conectar a MongoDB
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV}`);
      logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
    });

    return server;
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
let server;
startServer().then(s => {
  server = s;
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
