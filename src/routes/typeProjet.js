const express = require('express');
const router = express.Router();
const {
  listerTypes,
  getChamps,
  ajouterChamp,
  modifierChamp,
  supprimerChamp,
} = require('../controllers/typeProjetController');
const { listerParType } = require('../controllers/documentTemplateController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerTypes);
router.get('/:code/champs', verifierToken, verifierRole('admin'), getChamps);
router.post('/:code/champs', verifierToken, verifierRole('admin'), ajouterChamp);
router.put('/champs/:id', verifierToken, verifierRole('admin'), modifierChamp);
router.delete('/champs/:id', verifierToken, verifierRole('admin'), supprimerChamp);

// Documents & Templates par type de projet
router.get('/:code/documents', verifierToken, verifierRole('admin'), listerParType);

module.exports = router;
