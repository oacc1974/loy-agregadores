const mongoose = require('mongoose');
const { encryptData, decryptData } = require('../utils/encryption');

const loyverseConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  credentials: {
    accessToken: {
      type: String,
      required: true,
      set: function(value) {
        if (!value) return value;
        return encryptData(value);
      },
      get: function(value) {
        if (!value) return '';
        return decryptData(value);
      }
    },
    storeId: {
      type: String,
      required: true
    },
    posId: {
      type: String,
      default: ''
    }
  },
  settings: {
    defaultTaxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    defaultPaymentType: {
      type: String,
      default: 'CASH'
    },
    employeeId: {
      type: String,
      default: ''
    }
  },
  mapping: {
    categoryMapping: [{
      aggregatorCategory: String,
      loyverseCategory: String
    }],
    paymentMapping: [{
      aggregatorPayment: String,
      loyversePayment: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('LoyverseConfig', loyverseConfigSchema);
