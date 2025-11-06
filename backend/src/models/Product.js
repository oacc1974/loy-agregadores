const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  aggregatorProductId: {
    type: String,
    required: true,
    index: true
  },
  loyverseItemId: {
    type: String,
    default: '',
    index: true
  },
  mapping: {
    name: String,
    description: String,
    price: Number,
    sku: String,
    category: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto único
productSchema.index({ userId: 1, aggregatorType: 1, aggregatorProductId: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
