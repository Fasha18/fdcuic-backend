const express = require('express');
const router = express.Router();
const {
  listerCandidats,
  detailCandidat,
  getAppelsCandidat,
  getMobilitesCandidat,
  getHistoriqueCandidat,
  getNotificationsCandidat,
  supprimerCandidat,
} = require('../controllers/candidatController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerCandidats);
router.get('/:id', verifierToken, verifierRole('admin'), detailCandidat);
router.get('/:id/appels', verifierToken, verifierRole('admin'), getAppelsCandidat);
router.get('/:id/mobilites', verifierToken, verifierRole('admin'), getMobilitesCandidat);
router.get('/:id/historique', verifierToken, verifierRole('admin'), getHistoriqueCandidat);
router.get('/:id/notifications', verifierToken, verifierRole('admin'), getNotificationsCandidat);
router.delete('/:id', verifierToken, verifierRole('admin'), supprimerCandidat);

module.exports = router;
