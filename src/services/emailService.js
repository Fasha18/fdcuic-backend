// Configuration de l'API Brevo (Sendinblue)
// Utilisation du port HTTP (443) pour contourner le blocage SMTP de Railway

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = 'fbiaye18@gmail.com';
const SENDER_NAME = 'FDCUIC';

const sendBrevoEmail = async (toEmail, toName, subject, content, isText = false) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail, name: toName }],
    subject: subject,
  };
  
  if (isText) {
    payload.textContent = content;
  } else {
    payload.htmlContent = content;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API Brevo:', errorData);
      throw new Error(`Erreur Brevo: ${response.status}`);
    }

    console.log(`Email envoyé avec succès via Brevo à ${toEmail}`);
  } catch (error) {
    console.error('Exception lors de l\'envoi de l\'email:', error.message);
    throw error;
  }
};

const envoyerEmailActivation = async (email, prenom, token) => {
  const lien = `https://fdcuic-backend-production.up.railway.app/api/auth/activer/${token}`;
  
  const text = `Bonjour ${prenom},

Merci de vous être inscrit sur FDCUIC.

Pour activer votre compte, veuillez copier et coller le lien suivant dans votre navigateur :
${lien}

Ce lien est valable 24 heures.

L'équipe FDCUIC`;

  await sendBrevoEmail(email, prenom, 'Activez votre compte FDCUIC', text, true);
};

const envoyerEmailBienvenue = async (email, prenom) => {
  const html = templateEmail(prenom, '', `
    <p>Bienvenue sur la plateforme <strong>FDCUIC</strong> !</p>
    <p>Votre compte a été créé avec succès. Vous pouvez dès à présent vous connecter et explorer les appels à projets disponibles.</p>
    <p style="text-align:center; margin: 28px 0;">
      <a href="https://fdcuic-backend-production.up.railway.app" style="display:inline-block;background:#1B6CA8;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">
        🚀 Accéder à la plateforme
      </a>
    </p>
    <p style="color:#888; font-size:13px;">Si vous n'avez pas créé ce compte, ignorez cet email.</p>
  `);
  await sendBrevoEmail(email, prenom, '🎉 Bienvenue sur FDCUIC !', html);
};

const envoyerEmailSoumission = async (email, prenom, titre) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0D1B2A;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;">FDCUIC</h1>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;">
        <h2 style="color:#0D1B2A;">Bonjour ${prenom},</h2>
        <p style="color:#444;">
          Votre dossier <strong>${titre}</strong> a bien été reçu et passera en phase d'examen.
        </p>
      </div>
    </div>
  `;

  await sendBrevoEmail(email, prenom, 'Dossier reçu — FDCUIC', html);
};

const envoyerEmailStatut = async (email, prenom, titre, statut) => {
  const messages = {
    en_examen: { texte: "Votre dossier est en cours d'examen.", couleur: '#1B6CA8' },
    accepte:   { texte: 'Félicitations ! Votre dossier a été accepté.', couleur: '#16a34a' },
    rejete:    { texte: "Votre dossier n'a pas été retenu.", couleur: '#dc2626' },
  };
  const info = messages[statut] || { texte: `Statut : ${statut}`, couleur: '#444' };

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0D1B2A;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;">FDCUIC</h1>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;">
        <h2 style="color:#0D1B2A;">Bonjour ${prenom},</h2>
        <p style="color:#444;">
          Le statut de votre dossier <strong>${titre}</strong> a été mis à jour.
        </p>
        <p style="color:${info.couleur};font-weight:bold;">${info.texte}</p>
      </div>
    </div>
  `;

  await sendBrevoEmail(email, prenom, 'Mise à jour de votre dossier — FDCUIC', html);
};

const templateEmail = (prenom, titre, contenu) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5;
           margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto;
                 background: white; border-radius: 12px;
                 overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1A3A8F, #4F6AF6);
              padding: 32px; text-align: center; }
    .header img { width: 60px; margin-bottom: 12px; }
    .header h1 { color: white; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .body p { color: #333; line-height: 1.7; font-size: 15px; }
    .status-badge { display: inline-block; padding: 8px 20px;
                    border-radius: 20px; font-weight: bold;
                    font-size: 14px; margin: 16px 0; }
    .footer { background: #f8f9fa; padding: 20px 32px;
              text-align: center; color: #888; font-size: 12px;
              border-top: 1px solid #eee; }
    .btn { display: inline-block; background: #1A3A8F; color: white;
           padding: 12px 28px; border-radius: 8px; text-decoration: none;
           font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FDCUIC</h1>
      <p style="color:rgba(255,255,255,0.8); margin:4px 0 0;">
        Fonds de Développement des Cultures Urbaines
      </p>
    </div>
    <div class="body">
      <p>Bonjour <strong>${prenom}</strong>,</p>
      ${contenu}
      <p style="margin-top:24px; color:#888; font-size:13px;">
        Pour toute question, contactez-nous à
        <a href="mailto:contact@fdcuic.sn">contact@fdcuic.sn</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2026 FDCUIC — Tous droits réservés</p>
      <p>Fonds de Développement des Cultures Urbaines et Industries Créatives</p>
    </div>
  </div>
</body>
</html>
`;

const envoyerEmailResetPassword = async (email, prenom, token) => {
  const lien = `${process.env.FRONTEND_URL || 'https://fdcuic-backend-production.up.railway.app'}/reset-password?token=${token}`;

  const html = templateEmail(prenom, '', `
    <p>Vous avez demandé la réinitialisation de votre mot de passe sur FDCUIC.</p>
    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
    <p style="text-align:center; margin: 28px 0;">
      <a href="${lien}" style="display:inline-block;background:#4F6AF6;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">
        🔐 Réinitialiser mon mot de passe
      </a>
    </p>
    <p style="color:#888; font-size:13px;">
      ⏱️ Ce lien est valable <strong>1 heure</strong> seulement.<br/>
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre compte reste sécurisé.
    </p>
  `);

  await sendBrevoEmail(email, prenom, '🔐 Réinitialisation de mot de passe — FDCUIC', html);
};

const envoyerEmailNotification = async (email, prenom, sujet, contenu) => {
  const html = templateEmail(prenom, '', contenu);
  await sendBrevoEmail(email, prenom, sujet, html);
};

module.exports = {
  envoyerEmailActivation,
  envoyerEmailBienvenue,
  envoyerEmailSoumission,
  envoyerEmailStatut,
  envoyerEmailNotification,
  envoyerEmailResetPassword,
};