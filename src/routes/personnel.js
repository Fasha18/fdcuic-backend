const express = require('express');
const router = express.Router();
const {
  listerPersonnel,
  creerPersonnel,
  modifierPersonnel,
  supprimerPersonnel,
} = require('../controllers/personnelController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerPersonnel);
router.post('/', verifierToken, verifierRole('admin'), creerPersonnel);
router.put('/:id', verifierToken, verifierRole('admin'), modifierPersonnel);
router.delete('/:id', verifierToken, verifierRole('admin'), supprimerPersonnel);

module.exports = router;
