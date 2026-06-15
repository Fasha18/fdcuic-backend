const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getCampagnes, 
  getCampagneById,
  modifierCampagne, 
  supprimerCampagne, 
  uploadImageCampagne,
  getCandidaturesAppel,
  getProgrammeMobilite, 
  modifierProgrammeMobilite, 
  uploadImageProgrammeMobilite,
  getCandidaturesMobilite,
  rechercheCandidats
} = require('../controllers/adminController');
const { verifierToken, verifierRole } = require('../middlewares/auth');
const uploadAppelProjet = require('../config/multerAppelProjet');
const uploadMobilite = require('../config/multerMobilite');

router.get('/stats', verifierToken, verifierRole('admin'), getDashboardStats);
router.get('/recherche', verifierToken, verifierRole('admin'), rechercheCandidats);

// ── CAMPAGNES (Appels à projets admin) ──
router.get('/appels', verifierToken, verifierRole('admin'), getCampagnes);
router.get('/appels/:id', verifierToken, verifierRole('admin'), getCampagneById);
router.put('/appels/:id', verifierToken, verifierRole('admin'), modifierCampagne);
router.delete('/appels/:id', verifierToken, verifierRole('admin'), supprimerCampagne);
router.post('/appels/:id/image', verifierToken, verifierRole('admin'), uploadAppelProjet.single('image_couverture'), uploadImageCampagne);
router.get('/appels/:id/candidatures', verifierToken, verifierRole('admin'), getCandidaturesAppel);

// ── PROGRAMME MOBILITÉ (Unique) ──
router.get('/mobilite/programme', verifierToken, verifierRole('admin'), getProgrammeMobilite);
router.put('/mobilite/programme', verifierToken, verifierRole('admin'), modifierProgrammeMobilite);
router.post('/mobilite/programme/image', verifierToken, verifierRole('admin'), uploadMobilite.single('image_couverture'), uploadImageProgrammeMobilite);
router.get('/mobilite/candidatures', verifierToken, verifierRole('admin'), getCandidaturesMobilite);

module.exports = router;