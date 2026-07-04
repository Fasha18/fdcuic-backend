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
      est_active: false,
      token_activation,
    });

    // Envoi de l'email d'activation (attente du résultat pour garantir l'envoi)
    try {
      await envoyerEmailActivation(user.email, user.prenom, user.token_activation);
    } catch (emailError) {
      // Si l'email échoue, on supprime le compte pour forcer une ré-inscription propre
      await user.destroy();
      console.error('❌ Erreur envoi email activation:', emailError.message);
      return res.status(500).json({
        message: "Impossible d'envoyer l'email d'activation. Vérifiez votre adresse email et réessayez.",
      });
    }

    return res.status(201).json({
      message: "Inscription réussie ! Un email d'activation vous a été envoyé. Cliquez sur le lien pour activer votre compte.",
      userId: user.id
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

const pageTemplate = (titre, icone, titreH1, message, actionHtml = '') => `
  <html>
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${titre} — FDCUIC</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f0f4f8;
               display: flex; align-items: center; justify-content: center;
               min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: white; border-radius: 12px; padding: 48px 32px;
                text-align: center; max-width: 460px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .icon { font-size: 56px; margin-bottom: 20px; line-height: 1; }
        h1 { color: #0D1B2A; font-size: 24px; margin-bottom: 16px; margin-top: 0; }
        p { color: #4b5563; line-height: 1.6; margin-bottom: 28px; font-size: 15px; }
        .btn { display: inline-block; background: #1B6CA8; border: none;
               color: white; padding: 14px 32px; border-radius: 8px; font-size: 16px;
               text-decoration: none; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn:hover { background: #145585; }
        .btn-outline { background: transparent; border: 2px solid #1B6CA8; color: #1B6CA8; }
        .btn-outline:hover { background: #f0f7fb; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${icone}</div>
        <h1>${titreH1}</h1>
        <p>${message}</p>
        ${actionHtml}
      </div>
    </body>
  </html>
`;

// ── ACTIVATION DU COMPTE (GET) ─────────────────────────────
const activerCompte = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { token_activation: token } });

    // Si le token n'existe pas en base
    if (!user) {
      return res.status(404).send(pageTemplate(
        "Lien invalide", "❌", "Lien expiré ou invalide",
        "Ce lien d'activation n'est plus valide ou a déjà été utilisé.<br/>Si votre compte n'est pas activé, veuillez vous connecter pour demander un nouveau lien."
      ));
    }

    // Si le compte est déjà activé
    if (user.est_active) {
      return res.send(pageTemplate(
        "Compte déjà activé", "✅", "Compte déjà actif",
        "Votre compte est déjà activé. Vous pouvez vous connecter à la plateforme.",
        `<a href="${process.env.FRONTEND_URL || 'https://fdcuic-backend-production.up.railway.app'}" class="btn">Aller à la connexion</a>`
      ));
    }

    // Le token est valide, on affiche la page de confirmation (pour bloquer le pre-fetch des bots emails)
    return res.send(pageTemplate(
      "Activer votre compte", "👋", `Bonjour ${user.prenom},`,
      "Bienvenue sur FDCUIC !<br/>Veuillez cliquer sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.",
      `<form method="POST" action="/api/auth/activer/${token}">
         <button type="submit" class="btn">Confirmer mon activation</button>
       </form>`
    ));

  } catch (error) {
    return res.status(500).send(pageTemplate("Erreur", "⚠️", "Erreur Serveur", "Une erreur est survenue lors de la vérification de votre lien."));
  }
};

// ── CONFIRMATION DE L'ACTIVATION (POST) ────────────────────
const confirmerActivation = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { token_activation: token } });

    if (!user) {
      return res.status(404).send(pageTemplate(
        "Erreur", "❌", "Lien expiré",
        "Ce lien d'activation n'est plus valide ou a déjà été utilisé."
      ));
    }

    if (user.est_active) {
      return res.send(pageTemplate(
        "Déjà activé", "✅", "Compte déjà actif",
        "Votre compte est déjà activé.",
        `<a href="${process.env.FRONTEND_URL || 'https://fdcuic-backend-production.up.railway.app'}" class="btn">Aller à la connexion</a>`
      ));
    }

    // Activation effective
    await user.update({ est_active: true, token_activation: null });

    return res.send(pageTemplate(
      "Compte activé", "🎉", "Compte activé avec succès !",
      "Félicitations, votre compte FDCUIC est maintenant actif.<br/>Vous pouvez dès à présent vous connecter à la plateforme.",
      `<a href="${process.env.FRONTEND_URL || 'https://fdcuic-backend-production.up.railway.app'}" class="btn">Me connecter</a>`
    ));

  } catch (error) {
    return res.status(500).send(pageTemplate("Erreur", "⚠️", "Erreur Serveur", "Une erreur est survenue lors de l'activation."));
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

    if (user.est_supprime) {
      return res.status(403).json({ message: 'Ce compte n\'existe plus.' });
    }

    if (user.est_desactive) {
      return res.status(403).json({ message: 'Votre compte a été désactivé. Contactez l\'administration.' });
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

    await user.update({ derniere_connexion: new Date() });

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
  confirmerActivation,
  connexion,
  demanderResetPassword,
  confirmerResetPassword,
};