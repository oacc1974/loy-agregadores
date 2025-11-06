const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`✅ MongoDB conectado: ${conn.connection.host}`);

    // Eventos de mongoose
    mongoose.connection.on('error', (err) => {
      logger.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconectado');
    });

  } catch (error) {
    logger.error('❌ Error al conectar MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
