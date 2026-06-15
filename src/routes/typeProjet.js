const express = require('express');
const router = express.Router();
const {
  listerTypes,
  getChamps,
  ajouterChamp,
  modifierChamp,
  supprimerChamp,
} = require('../controllers/typeProjetController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerTypes);
router.get('/:code/champs', verifierToken, verifierRole('admin'), getChamps);
router.post('/:code/champs', verifierToken, verifierRole('admin'), ajouterChamp);
router.put('/champs/:id', verifierToken, verifierRole('admin'), modifierChamp);
router.delete('/champs/:id', verifierToken, verifierRole('admin'), supprimerChamp);

module.exports = router;
