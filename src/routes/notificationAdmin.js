const express = require('express');
const router = express.Router();
const {
  listerNotificationsAdmin,
  envoyerNotification,
} = require('../controllers/notificationAdminController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Admin uniquement
router.get('/', verifierToken, verifierRole('admin'), listerNotificationsAdmin);
router.post('/envoyer', verifierToken, verifierRole('admin'), envoyerNotification);

module.exports = router;
