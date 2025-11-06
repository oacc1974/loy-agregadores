const express = require('express');
const {
  getAggregators,
  addAggregator,
  getAggregator,
  updateAggregator,
  deleteAggregator,
  toggleAggregator
} = require('../controllers/aggregator.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // Todas las rutas requieren autenticación

router.route('/')
  .get(getAggregators)
  .post(addAggregator);

router.route('/:id')
  .get(getAggregator)
  .put(updateAggregator)
  .delete(deleteAggregator);

router.post('/:id/toggle', toggleAggregator);

module.exports = router;
