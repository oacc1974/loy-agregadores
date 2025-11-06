const express = require('express');
const {
  configure,
  getConfig,
  testConnection,
  getStores,
  getItems,
  getCategories,
  createReceipt
} = require('../controllers/loyverse.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // Todas las rutas requieren autenticación

router.post('/configure', configure);
router.get('/config', getConfig);
router.post('/test-connection', testConnection);
router.get('/stores', getStores);
router.get('/items', getItems);
router.get('/categories', getCategories);
router.post('/receipt', createReceipt);

module.exports = router;
