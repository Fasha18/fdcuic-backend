const express = require('express');
const router = express.Router();
const {
  etape1, etape2, etape3,
  soumettre, mesDossiers,
  tousDossiers, changerStatut, supprimerDossier
} = require('../controllers/appelProjetController');
const { verifierToken, verifierRole } = require('../middlewares/auth');
const upload = require('../config/multerAppelProjet');

// Étape 1 — Informations générales
router.post('/etape1', verifierToken, etape1);

// Étape 2 — Détails et impacts
router.put('/:id/etape2', verifierToken, etape2);

// Étape 3 — Documents (upload multiple)
router.put('/:id/etape3', verifierToken, upload.fields([
  { name: 'doc_ninea_recepisse', maxCount: 1 },
  { name: 'doc_cni_passeport',   maxCount: 1 },
  { name: 'doc_budget',          maxCount: 1 },
  { name: 'doc_plan_action',     maxCount: 1 },
  { name: 'doc_photo_prototype', maxCount: 1 },
  { name: 'doc_analyse_financiere', maxCount: 1 },
  { name: 'doc_business_model',  maxCount: 1 },
]), etape3);

// Étape 4 — Soumettre
router.put('/:id/soumettre', verifierToken, soumettre);

// Mes dossiers
router.get('/mes-dossiers', verifierToken, mesDossiers);

// Tous les dossiers (Admin)
router.get('/', verifierToken, verifierRole('admin'), tousDossiers);

// Changer statut (Admin)
router.put('/:id/statut', verifierToken, verifierRole('admin'), changerStatut);

// Supprimer dossier (Admin)
router.delete('/:id', verifierToken, verifierRole('admin'), supprimerDossier);

module.exports = router;