const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models/index');
const { envoyerEmailActivation, envoyerEmailBienvenue, envoyerEmailResetPassword } = require('../services/emailService');

// ── INSCRIPTION ───────────────────────────────────────────
const inscription = async (req, res) => {
  try {
    const {
      nom, prenom, email, telephone,
      mot_de_passe, confirmation_mot_de_passe,
    } = req.body;

    if (mot_de_passe !== confirmation_mot_de_passe) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }
    if (mot_de_passe.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const phoneRegex = /^(\+221|00221)?[7][0|5|6|7|8][0-9]{7}$/;
    if (!phoneRegex.test(telephone)) {
      return res.status(400).json({ message: 'Numéro de téléphone sénégalais invalide.' });
    }

    const userExistant = await User.findOne({ where: { email } });
    if (userExistant) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 12);
    const token_activation = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      nom, prenom, email, telephone,
      mot_de_passe_hash,
      role: 'candidat',
      est_active: true,        // ✅ Activation immédiate — pas besoin d'email
      token_activation: null,
    });

    // Envoi d'un email de bienvenue en arrière-plan (non bloquant)
    envoyerEmailBienvenue(user.email, user.prenom)
      .then(() => console.log(`Email de bienvenue envoyé à ${user.email}`))
      .catch(emailError => console.error('⚠️ Email bienvenue non envoyé (non bloquant):', emailError.message));

    return res.status(201).json({
      message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
      userId: user.id
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ACTIVATION DU COMPTE ──────────────────────────────────
const activerCompte = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { token_activation: token } });

    if (!user) {
      return res.status(400).json({ message: "Lien d'activation invalide ou expiré." });
    }
    if (user.est_active) {
      return res.status(400).json({ message: 'Ce compte est déjà activé. Vous pouvez vous connecter.' });
    }

    await user.update({ est_active: true, token_activation: null });

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
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── CONNEXION ─────────────────────────────────────────────
const connexion = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (!user.est_active) {
      return res.status(403).json({
        message: "Compte non activé. Veuillez vérifier votre email et cliquer sur le lien d'activation."
      });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

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
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── DEMANDE DE RÉINITIALISATION MOT DE PASSE ─────────────
// POST /api/auth/reset-password
const demanderResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'L\'email est requis.' });
    }

    const user = await User.findOne({ where: { email } });

    // ⚠️ Toujours retourner 200 pour ne pas révéler si l'email existe
    if (!user) {
      return res.status(200).json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      });
    }

    // Générer un token sécurisé valable 1 heure
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // +1 heure

    await user.update({
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry,
    });

    // Envoi de l'email en arrière-plan
    envoyerEmailResetPassword(user.email, user.prenom, resetToken)
      .catch(err => console.error('Erreur email reset:', err.message));

    return res.status(200).json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── CONFIRMATION RÉINITIALISATION MOT DE PASSE ───────────
// POST /api/auth/reset-password/confirmer
const confirmerResetPassword = async (req, res) => {
  try {
    const { token, nouveau_mot_de_passe, confirmation_mot_de_passe } = req.body;

    if (!token || !nouveau_mot_de_passe) {
      return res.status(400).json({ message: 'Token et nouveau mot de passe requis.' });
    }

    if (nouveau_mot_de_passe !== confirmation_mot_de_passe) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }

    if (nouveau_mot_de_passe.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    // Trouver l'utilisateur avec ce token non expiré
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: new Date() }, // token non expiré
      },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Lien de réinitialisation invalide ou expiré. Faites une nouvelle demande.',
      });
    }

    // Hacher le nouveau mot de passe et effacer le token
    const mot_de_passe_hash = await bcrypt.hash(nouveau_mot_de_passe, 12);
    await user.update({
      mot_de_passe_hash,
      reset_token: null,
      reset_token_expiry: null,
    });

    return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.' });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  inscription,
  activerCompte,
  connexion,
  demanderResetPassword,
  confirmerResetPassword,
};