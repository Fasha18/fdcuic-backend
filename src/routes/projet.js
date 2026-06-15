const express = require('express');
const router = express.Router();
const {
  soumettreProjet,
  mesProjets,
  detailProjet,
  listerTousProjets,
  changerStatut,
} = require('../controllers/projetController');
const { verifierToken, verifierRole } = require('../middlewares/auth');
const upload = require('../config/multer');

// Candidat — soumettre un projet avec PDF
router.post('/', verifierToken, verifierRole('candidat'), upload.single('fichier_pdf'), soumettreProjet);

// Candidat — voir ses propres projets
router.get('/mes-projets', verifierToken, verifierRole('candidat'), mesProjets);

// Admin — voir tous les projets
router.get('/', verifierToken, verifierRole('admin'), listerTousProjets);

// Admin + Candidat — détail d'un projet
router.get('/:id', verifierToken, detailProjet);

// Admin — changer le statut
router.put('/:id/statut', verifierToken, verifierRole('admin'), changerStatut);

module.exports = router;