const express = require('express');
const {
  configure,
  getConfig,
  updateConfig,
  testConnection,
  getOrders,
  getMenu,
  webhook
} = require('../controllers/uber.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Webhook público (sin autenticación)
router.post('/webhook', webhook);

// Rutas protegidas
router.use(protect);

router.post('/configure', configure);
router.get('/config', getConfig);
router.put('/config', updateConfig);
router.post('/test-connection', testConnection);
router.get('/orders', getOrders);
router.get('/menu', getMenu);

module.exports = router;
