const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Verificar que existe la URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    logger.info('🔄 Conectando a MongoDB...');
    
    // Las opciones useNewUrlParser y useUnifiedTopology ya no son necesarias
    const conn = await mongoose.connect(process.env.MONGODB_URI);

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
    logger.error('❌ Error al conectar MongoDB:', error.message);
    logger.error('URI utilizada:', process.env.MONGODB_URI ? 'Configurada' : 'NO CONFIGURADA');
    process.exit(1);
  }
};

module.exports = connectDB;
