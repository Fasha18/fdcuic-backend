const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  inscription, activerCompte, confirmerActivation, connexion,
  demanderResetPassword, confirmerResetPassword,
} = require('../controllers/authController');

// ── RATE LIMITERS ──────────────────────────────────────────
// Max 5 tentatives de connexion par IP en 15 minutes
const limiterConnexion = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
  skipSuccessfulRequests: true,
});

// Max 3 inscriptions par IP par heure
const limiterInscription = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    message: "Trop de demandes d'inscription depuis cette adresse. Réessayez dans 1 heure.",
  },
});

// Max 3 demandes de reset par IP par heure
const limiterReset = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.',
  },
});

// ── ROUTES ────────────────────────────────────────────────
router.post('/inscription', limiterInscription, inscription);
router.get('/activer/:token', activerCompte);
router.post('/activer/:token', confirmerActivation);
router.post('/connexion', limiterConnexion, connexion);

// Réinitialisation de mot de passe
router.post('/reset-password', limiterReset, demanderResetPassword);
router.post('/reset-password/confirmer', confirmerResetPassword);

module.exports = router;