const express = require('express');
const router = express.Router();

const { evaluerProjet, detailEvaluation, modifierEvaluation } = require('../controllers/evaluationController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Évaluer un projet — évaluateur uniquement
router.post(
  '/',
  verifierToken,
  verifierRole('evaluateur'),
  evaluerProjet
);

// Détail d'une évaluation — admin ou évaluateur
router.get(
  '/:id',
  verifierToken,
  verifierRole('admin', 'evaluateur'),
  detailEvaluation
);

// Modifier une évaluation — évaluateur uniquement
router.put(
  '/:id',
  verifierToken,
  verifierRole('evaluateur'),
  modifierEvaluation
);

module.exports = router;