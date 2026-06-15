const express = require('express');
const router = express.Router();
const { inscription, activerCompte, connexion } = require('../controllers/authController');

router.post('/inscription', inscription);
router.get('/activer/:token', activerCompte);
router.post('/connexion', connexion);




module.exports = router;