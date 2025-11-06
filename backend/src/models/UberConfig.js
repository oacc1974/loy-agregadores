const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const uberConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
    clientId: {
      type: String,
      required: true
    },
    clientSecret: {
      type: String,
      required: true,
      set: function(value) {
        // Encriptar el client secret
        return CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString();
      },
      get: function(value) {
        // Desencriptar el client secret
        if (!value) return '';
        const bytes = CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
      }
    },
    accessToken: {
      type: String,
      default: ''
    },
    refreshToken: {
      type: String,
      default: ''
    },
    tokenExpiry: {
      type: Date,
      default: null
    }
  },
  settings: {
    autoSync: {
      type: Boolean,
      default: false
    },
    syncInterval: {
      type: Number,
      default: 5, // minutos
      min: 1,
      max: 60
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
  },
  webhookUrl: {
    type: String,
    default: ''
  },
  lastSync: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('UberConfig', uberConfigSchema);
