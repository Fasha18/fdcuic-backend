const express = require('express');
const router = express.Router();
const {
  listerSecteursPublic,
  listerSecteurs,
  creerSecteur,
  modifierSecteur,
  supprimerSecteur,
} = require('../controllers/secteurController');
const { verifierToken, verifierRole } = require('../middlewares/auth');

// Public
router.get('/public', listerSecteursPublic);

// Admin
router.get('/', verifierToken, verifierRole('admin'), listerSecteurs);
router.post('/', verifierToken, verifierRole('admin'), creerSecteur);
router.put('/:id', verifierToken, verifierRole('admin'), modifierSecteur);
router.delete('/:id', verifierToken, verifierRole('admin'), supprimerSecteur);

module.exports = router;
