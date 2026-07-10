const express = require('express');
const router = express.Router();
const { getRegions, getPays } = require('../controllers/referentielsController');

router.get('/regions', getRegions);
router.get('/pays', getPays);

module.exports = router;
