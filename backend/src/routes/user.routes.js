const express = require('express');
const {
  getProfile,
  updateProfile,
  deleteAccount
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // Todas las rutas requieren autenticación

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.delete('/account', deleteAccount);

module.exports = router;
