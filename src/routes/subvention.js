const express = require('express');
const router = express.Router();

const { attribuerSubvention, mettreAJourStatut, detailSubvention, getAllSubventions } = require('../controllers/subventionController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Lister toutes les subventions — admin uniquement
router.get(
  '/',
  verifierToken,
  verifierRole('admin'),
  getAllSubventions
);

// Attribuer une subvention — admin uniquement
router.post(
  '/',
  verifierToken,
  verifierRole('admin'),
  attribuerSubvention
);

// Détail d'une subvention — admin uniquement
router.get(
  '/:id',
  verifierToken,
  verifierRole('admin'),
  detailSubvention
);

// Mettre à jour le statut paiement — admin uniquement
router.put(
  '/:id',
  verifierToken,
  verifierRole('admin'),
  mettreAJourStatut
);

module.exports = router;