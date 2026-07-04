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
  getCandidaturesMobilite,
  rechercheCandidats,
  getCandidatures,
  getCandidatureById,
  desactiverCandidature,
  reactiverCandidature,
  supprimerCandidatureSoft,
  renvoyerActivationCandidature,
  getSoumissionnaires,
  getSoumissionnaireById
} = require('../controllers/adminController');
const { verifierToken, verifierRole } = require('../middlewares/auth');
const uploadAppelProjet = require('../config/multerAppelProjet');
const uploadMobilite = require('../config/multerMobilite');

router.get('/stats', verifierToken, verifierRole('admin', 'evaluateur'), getDashboardStats);
router.get('/recherche', verifierToken, verifierRole('admin'), rechercheCandidats);

// ── CANDIDATURES GLOBALES (Tous les inscrits) ──
router.get('/candidatures', verifierToken, verifierRole('admin'), getCandidatures);
router.get('/candidatures/:id', verifierToken, verifierRole('admin'), getCandidatureById);
router.put('/candidatures/:id/desactiver', verifierToken, verifierRole('admin'), desactiverCandidature);
router.put('/candidatures/:id/reactiver', verifierToken, verifierRole('admin'), reactiverCandidature);
router.delete('/candidatures/:id', verifierToken, verifierRole('admin'), supprimerCandidatureSoft);
router.post('/candidatures/:id/renvoyer-activation', verifierToken, verifierRole('admin'), renvoyerActivationCandidature);

// ── SOUMISSIONNAIRES ──
router.get('/soumissionnaires', verifierToken, verifierRole('admin', 'evaluateur'), getSoumissionnaires);
router.get('/soumissionnaires/:id', verifierToken, verifierRole('admin', 'evaluateur'), getSoumissionnaireById);

// ── DOSSIERS (détail + évaluation) ──
const { getDossierById, evaluerConformite, evaluerContenu } = require('../controllers/dossierController');
router.get('/dossiers/:id', verifierToken, verifierRole('admin', 'evaluateur'), getDossierById);
router.patch('/dossiers/:id/conformite', verifierToken, verifierRole('admin', 'evaluateur'), evaluerConformite);
router.patch('/dossiers/:id/evaluation', verifierToken, verifierRole('admin', 'evaluateur'), evaluerContenu);

// ── CAMPAGNES (Appels à projets admin) ──
router.get('/appels', verifierToken, verifierRole('admin'), getCampagnes);
router.get('/appels/:id', verifierToken, verifierRole('admin'), getCampagneById);
router.put('/appels/:id', verifierToken, verifierRole('admin'), modifierCampagne);
router.delete('/appels/:id', verifierToken, verifierRole('admin'), supprimerCampagne);
router.post('/appels/:id/image', verifierToken, verifierRole('admin'), uploadAppelProjet.single('image_couverture'), uploadImageCampagne);
router.get('/appels/:id/candidatures', verifierToken, verifierRole('admin'), getCandidaturesAppel);

// ── PROGRAMME MOBILITÉ ──
router.get('/mobilite/candidatures', verifierToken, verifierRole('admin'), getCandidaturesMobilite);

// ── NOUVELLES ROUTES MOBILITÉ (Tableau, Stats, Statut) ──
const { changerStatut, getProgrammeMobiliteStats, supprimerCandidature, getMobiliteById } = require('../controllers/mobiliteController');
router.get('/mobilite', verifierToken, verifierRole('admin'), getCandidaturesMobilite); // Réutilise getCandidaturesMobilite
router.get('/mobilite/stats', verifierToken, verifierRole('admin'), getProgrammeMobiliteStats);
router.get('/mobilite/:id', verifierToken, verifierRole('admin'), getMobiliteById);
router.put('/mobilite/:id/statut', verifierToken, verifierRole('admin'), changerStatut);
router.delete('/mobilite/:id', verifierToken, verifierRole('admin'), supprimerCandidature);

// ── TYPES DE PROJET ──
const typeProjetController = require('../controllers/typeProjetController');
router.get('/types-projet', verifierToken, verifierRole('admin'), typeProjetController.listerTypes);
router.post('/types-projet', verifierToken, verifierRole('admin'), typeProjetController.creerType);
router.put('/types-projet/:id', verifierToken, verifierRole('admin'), typeProjetController.modifierType);
router.delete('/types-projet/:id', verifierToken, verifierRole('admin'), typeProjetController.supprimerType);

// ── DOCUMENT TEMPLATES (Ancien Système) ──
const docTemplateController = require('../controllers/documentTemplateController');
const { uploadTemplate } = require('../config/multerCloudinary');

router.post('/templates/:id/fichier', verifierToken, verifierRole('admin'), uploadTemplate.single('fichier'), docTemplateController.uploadFichierTemplate);

// ── DOCUMENTS MODELES (Nouveau Système) ──
const documentModeleController = require('../controllers/documentModeleController');
router.post('/types-projet/:id/documents-modeles', verifierToken, verifierRole('admin'), uploadTemplate.array('documents', 10), documentModeleController.uploadDocumentModeles);
router.get('/types-projet/:id/documents-modeles', verifierToken, verifierRole('admin'), documentModeleController.getDocumentsModelesParType);
router.delete('/documents-modeles/:docId', verifierToken, verifierRole('admin'), documentModeleController.supprimerDocumentModele);

module.exports = router;