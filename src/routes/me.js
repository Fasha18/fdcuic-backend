const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  updatePassword, 
  updatePreferences 
} = require('../controllers/meController');
const { verifierToken } = require('../middlewares/auth');
const { uploadAvatar: multerAvatarUpload } = require('../config/multerAvatar');

// Toutes ces routes nécessitent d'être connecté
router.use(verifierToken);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/avatar', multerAvatarUpload.single('avatar'), uploadAvatar);
router.patch('/mot-de-passe', updatePassword);
router.patch('/preferences', updatePreferences);

module.exports = router;
