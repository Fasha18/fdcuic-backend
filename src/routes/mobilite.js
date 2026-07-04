const express = require('express');
const router = express.Router();
const {
  etape1, etape2, etape3, etape4,
  soumettre, mesProjets, tousLesProjets, changerStatut, getProgrammeMobiliteStats
} = require('../controllers/mobiliteController');
const { verifierToken, verifierRole } = require('../middlewares/auth');
const uploadMobilite = require('../config/multerMobilite');

// Programme Mobilité Public
router.get('/programme-stats', getProgrammeMobiliteStats);

// Étape 1 — Informations générales (crée ou met à jour le brouillon)
router.post('/etape1', verifierToken, etape1);

// Étape 2 — Contexte et objectifs
router.put('/:id/etape2', verifierToken, etape2);

// Étape 3 — Programme et impact
router.put('/:id/etape3', verifierToken, etape3);

// Étape 4 — Documents et annexes (upload multiple)
router.put('/:id/etape4', verifierToken, uploadMobilite.fields([
  { name: 'doc_ninea',          maxCount: 1 },
  { name: 'doc_recepisse',      maxCount: 1 },
  { name: 'doc_invitation',     maxCount: 1 },
  { name: 'doc_note_structure', maxCount: 1 },
  { name: 'doc_cv_portfolio',   maxCount: 1 },
  { name: 'image_couverture',   maxCount: 1 },
]), etape4);

// Étape 5 — Récapitulatif + Soumettre
router.put('/:id/soumettre', verifierToken, soumettre);

// Mes projets mobilité
router.get('/mes-projets', verifierToken, mesProjets);

// Tous les projets mobilité (Admin)
router.get('/', verifierToken, verifierRole('admin'), tousLesProjets);

// Changer statut (Admin)
router.put('/:id/statut', verifierToken, verifierRole('admin'), changerStatut);

module.exports = router;