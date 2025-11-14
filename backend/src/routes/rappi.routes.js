const express = require('express');
const {
  configure,
  getConfig,
  testConnection,
  getOrders,
  webhook
} = require('../controllers/rappi.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Webhook público (sin autenticación)
router.post('/webhook', webhook);

// Rutas protegidas
router.use(protect);

router.post('/configure', configure);
router.get('/config', getConfig);
router.post('/test-connection', testConnection);
router.get('/orders', getOrders);

module.exports = router;
