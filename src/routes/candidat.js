const express = require('express');
const router = express.Router();
const {
  listerCandidats,
  detailCandidat,
} = require('../controllers/candidatController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerCandidats);
router.get('/:id', verifierToken, verifierRole('admin'), detailCandidat);

module.exports = router;
