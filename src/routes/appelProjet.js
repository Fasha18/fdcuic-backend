const express = require('express');
const router = express.Router();
const {
  etape1, etape2, etape3, uploadDocumentUnique,
  soumettre, mesDossiers,
  tousDossiers, changerStatut, supprimerDossier
} = require('../controllers/appelProjetController');
const { verifierToken, verifierRole } = require('../middlewares/auth');
const upload = require('../config/multerAppelProjet');

// Étape 1 — Informations générales
router.post('/etape1', verifierToken, etape1);

// Étape 2 — Détails et impacts
router.put('/:id/etape2', verifierToken, etape2);

// Étape 3 — Documents (upload multiple dynamique - gardé pour compatibilité)
router.put('/:id/etape3', verifierToken, upload.any(), etape3);

// Upload document unique (immédiat)
router.post('/:id/upload-document', verifierToken, upload.single('fichier'), uploadDocumentUnique);

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