const express = require('express');
const router = express.Router();
const {
  listerFaqsPublic,
  listerFaqs,
  creerFaq,
  modifierFaq,
  supprimerFaq,
} = require('../controllers/faqController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Public
router.get('/public', listerFaqsPublic);

// Admin
router.get('/', verifierToken, verifierRole('admin'), listerFaqs);
router.post('/', verifierToken, verifierRole('admin'), creerFaq);
router.put('/:id', verifierToken, verifierRole('admin'), modifierFaq);
router.delete('/:id', verifierToken, verifierRole('admin'), supprimerFaq);

module.exports = router;
