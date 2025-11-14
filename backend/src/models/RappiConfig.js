const mongoose = require('mongoose');
const { encryptData, decryptData } = require('../utils/encryption');

const rappiConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  aggregatorConfigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AggregatorConfig',
    required: true
  },
  credentials: {
    storeId: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true,
      set: encryptData,
      get: decryptData
    },
    secretKey: {
      type: String,
      required: true,
      set: encryptData,
      get: decryptData
    }
  },
  settings: {
    autoSync: {
      type: Boolean,
      default: false
    },
    syncInterval: {
      type: Number,
      default: 5
    },
    syncOrders: {
      type: Boolean,
      default: true
    },
    syncMenu: {
      type: Boolean,
      default: false
    },
    syncInventory: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('RappiConfig', rappiConfigSchema);
