const mongoose = require('mongoose');

const aggregatorConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  aggregatorType: {
    type: String,
    enum: ['uber', 'rappi', 'pedidosya'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
aggregatorConfigSchema.index({ userId: 1, aggregatorType: 1 });

module.exports = mongoose.model('AggregatorConfig', aggregatorConfigSchema);
