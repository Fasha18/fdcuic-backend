const express = require('express');
const router = express.Router();
const { listerJournal } = require('../controllers/journalController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerJournal);

module.exports = router;
