const express = require('express');
const router = express.Router();
const {
  getPageLegale,
  modifierPageLegale,
} = require('../controllers/legalController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Public
router.get('/:type', getPageLegale);

// Admin
router.put('/:type', verifierToken, verifierRole('admin'), modifierPageLegale);

module.exports = router;
