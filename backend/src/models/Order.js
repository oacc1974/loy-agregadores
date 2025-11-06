const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  aggregatorOrderId: {
    type: String,
    required: true,
    index: true
  },
  loyverseReceiptId: {
    type: String,
    default: '',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'synced', 'error'],
    default: 'pending',
    index: true
  },
  orderData: {
    orderNumber: String,
    customer: {
      name: String,
      phone: String,
      address: String
    },
    items: [{
      name: String,
      quantity: Number,
      price: Number,
      modifiers: [{
        name: String,
        price: Number
      }]
    }],
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    total: Number,
    paymentMethod: String,
    orderTime: Date,
    deliveryTime: Date
  },
  syncAttempts: {
    type: Number,
    default: 0
  },
  lastSyncAttempt: {
    type: Date,
    default: null
  },
  errorMessage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });
orderSchema.index({ aggregatorType: 1, aggregatorOrderId: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);
