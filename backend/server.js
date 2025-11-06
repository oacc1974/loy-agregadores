require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`🌍 Entorno: ${process.env.NODE_ENV}`);
  logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado');
    process.exit(0);
  });
});
