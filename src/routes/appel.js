const express = require('express');
const router = express.Router();
const { creerAppel, listerAppels, listerTousAppels, detailAppel, cloturerAppel } = require('../controllers/appelController');
const { verifierToken, verifierRole } = require('../middlewares/auth');



// Public — lister les appels ouverts
router.get('/', listerAppels);
// Public — lister tous les appels (candidat)
router.get('/tous', listerTousAppels);
// Public — détail d'un appel
router.get('/:id', detailAppel);
// Admin seulement — créer un appel
router.post('/', verifierToken, verifierRole('admin'), creerAppel);

// Admin seulement — clôturer un appel
router.put('/:id/cloturer', verifierToken, verifierRole('admin'), cloturerAppel);

module.exports = router;