const express = require('express');
const router = express.Router();

const { mesNotifications, marquerCommeLu, toutMarquerCommeLu } = require('../controllers/notificationController');
const { verifierToken } = require('../middlewares/auth');

// Mes notifications — tout utilisateur connecté
router.get('/', verifierToken, mesNotifications);

// Tout marquer comme lu — AVANT /:id pour éviter le conflit de routes
router.put('/tout-lire', verifierToken, toutMarquerCommeLu);

// Marquer une notification comme lue
router.put('/:id/lu', verifierToken, marquerCommeLu);

module.exports = router;