const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models/index');
const { envoyerEmailActivation } = require('../services/emailService');

// ── INSCRIPTION ───────────────────────────────────────────
const inscription = async (req, res) => {
  try {
    const {
      nom, prenom, email, telephone,
      mot_de_passe, confirmation_mot_de_passe,
    } = req.body;

    // Vérifier la confirmation du mot de passe
    if (mot_de_passe !== confirmation_mot_de_passe) {
      return res.status(400).json({
        message: 'Les mots de passe ne correspondent pas.'
      });
    }

    // Vérifier longueur minimale
    if (mot_de_passe.length < 8) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères.'
      });
    }

    // Vérifier format téléphone sénégalais
    const phoneRegex = /^(\+221|00221)?[7][0|5|6|7|8][0-9]{7}$/;
    if (!phoneRegex.test(telephone)) {
      return res.status(400).json({
        message: 'Numéro de téléphone sénégalais invalide.'
      });
    }

    // Vérifier si l'email existe déjà
    const userExistant = await User.findOne({ where: { email } });
    if (userExistant) {
      return res.status(400).json({
        message: 'Cet email est déjà utilisé.'
      });
    }

    // Hacher le mot de passe
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 12);

    // Générer le token d'activation unique
    const token_activation = crypto.randomBytes(32).toString('hex');

    // Créer le compte (non activé)
    const user = await User.create({
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe_hash,
      role: 'candidat',
      est_active: false,
      token_activation,
    });

   // Trouve la ligne qui envoie l'email et entoure-la :
try {
  await envoyerEmailActivation(user.email, user.token_activation);
} catch (emailError) {
  console.error('Erreur envoi email:', emailError.message);
}

// Ensuite retourne le succès
return res.status(201).json({
  message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
  userId: user.id
});

  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur.',
      error: error.message
    });
  }
};

// ── ACTIVATION DU COMPTE ──────────────────────────────────
const activerCompte = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { token_activation: token }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Lien d\'activation invalide ou expiré.'
      });
    }

    if (user.est_active) {
      return res.status(400).json({
        message: 'Ce compte est déjà activé. Vous pouvez vous connecter.'
      });
    }

    // Activer le compte
    await user.update({
      est_active: true,
      token_activation: null,
    });

    // Rediriger vers une page de succès
    return res.send(`
      <html>
        <head>
          <meta charset="UTF-8"/>
          <title>Compte activé — FDCUIC</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f0f4f8;
                   display: flex; align-items: center; justify-content: center;
                   min-height: 100vh; margin: 0; }
            .card { background: white; border-radius: 12px; padding: 48px;
                    text-align: center; max-width: 420px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .icon { font-size: 56px; margin-bottom: 16px; }
            h1 { color: #0D1B2A; font-size: 22px; margin-bottom: 12px; }
            p { color: #555; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 24px; background: #1B6CA8;
                   color: white; padding: 12px 28px; border-radius: 6px;
                   text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h1>Compte activé avec succès !</h1>
            <p>Votre compte FDCUIC est maintenant actif.<br/>
               Vous pouvez vous connecter à la plateforme.</p>
            <a class="btn" href="/">Retour à l'accueil</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur.',
      error: error.message
    });
  }
};

// ── CONNEXION ─────────────────────────────────────────────
const connexion = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Vérifier si le compte est activé
    if (!user.est_active) {
      return res.status(403).json({
        message: 'Compte non activé. Veuillez vérifier votre email et cliquer sur le lien d\'activation.'
      });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
    if (!motDePasseValide) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Connexion réussie !',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur.',
      error: error.message
    });
  }
};

module.exports = { inscription, activerCompte, connexion };