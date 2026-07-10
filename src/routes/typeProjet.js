const express = require('express');
const router = express.Router();
const {
  listerTypes,
  listerTypesPublic,
  creerType,
  modifierType,
  supprimerType,
} = require('../controllers/typeProjetController');
const { listerParType } = require('../controllers/documentTemplateController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Public
router.get('/public', listerTypesPublic);

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerTypes);
router.post('/', verifierToken, verifierRole('admin'), creerType);
router.put('/:id', verifierToken, verifierRole('admin'), modifierType);
router.delete('/:id', verifierToken, verifierRole('admin'), supprimerType);

// Documents & Templates par type de projet
router.get('/:code/documents', verifierToken, verifierRole('admin'), listerParType);

module.exports = router;
