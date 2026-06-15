const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifierToken } = require('../middlewares/auth');

// Mettre à jour les informations du profil
router.put('/', verifierToken, userController.updateProfil);

// Mettre à jour le mot de passe
router.put('/password', verifierToken, userController.updatePassword);

module.exports = router;
