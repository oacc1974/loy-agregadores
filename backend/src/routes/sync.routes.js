const express = require('express');
const {
  manualSync,
  getStatus,
  getLogs,
  getOrders,
  retryOrder
} = require('../controllers/sync.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // Todas las rutas requieren autenticación

router.post('/manual', manualSync);
router.get('/status', getStatus);
router.get('/logs', getLogs);
router.get('/orders', getOrders);
router.post('/orders/:id/retry', retryOrder);

module.exports = router;
