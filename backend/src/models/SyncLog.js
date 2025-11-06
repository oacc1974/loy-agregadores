const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  syncType: {
    type: String,
    enum: ['order', 'menu', 'inventory'],
    required: true
  },
  aggregatorType: {
    type: String,
    enum: ['uber', 'rappi', 'pedidosya'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'error', 'partial'],
    required: true,
    index: true
  },
  itemsProcessed: {
    type: Number,
    default: 0
  },
  itemsSuccess: {
    type: Number,
    default: 0
  },
  itemsFailed: {
    type: Number,
    default: 0
  },
  details: {
    startTime: Date,
    endTime: Date,
    duration: Number, // en milisegundos
    errors: [{
      itemId: String,
      error: String
    }]
  }
}, {
  timestamps: true
});

// Índice para búsquedas eficientes
syncLogSchema.index({ userId: 1, createdAt: -1 });
syncLogSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SyncLog', syncLogSchema);
