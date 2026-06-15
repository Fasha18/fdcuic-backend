const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const envoyerEmailActivation = async (email, prenom, token) => {
  const lien = `${process.env.APP_URL}/api/auth/activer/${token}`;
  await transporter.sendMail({
    from: `"FDCUIC" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Activez votre compte FDCUIC',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="color:white;margin:0;">FDCUIC</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;">
          <h2 style="color:#0D1B2A;">Bonjour ${prenom},</h2>
          <p style="color:#444;line-height:1.6;">
            Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour activer votre compte.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${lien}"
               style="background:#1B6CA8;color:white;padding:14px 32px;
                      border-radius:6px;text-decoration:none;font-weight:bold;">
              Activer mon compte
            </a>
          </div>
          <p style="color:#888;font-size:13px;">
            Ce lien est valable 24 heures.
          </p>
        </div>
      </div>
    `,
  });
};

const envoyerEmailSoumission = async (email, prenom, titre) => {
  await transporter.sendMail({
    from: `"FDCUIC" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Dossier reçu — FDCUIC',
    html: `
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
    `,
  });
};

const envoyerEmailStatut = async (email, prenom, titre, statut) => {
  const messages = {
    en_examen: { texte: "Votre dossier est en cours d'examen.", couleur: '#1B6CA8' },
    accepte:   { texte: 'Félicitations ! Votre dossier a été accepté.', couleur: '#16a34a' },
    rejete:    { texte: "Votre dossier n'a pas été retenu.", couleur: '#dc2626' },
  };
  const info = messages[statut] || { texte: `Statut : ${statut}`, couleur: '#444' };

  await transporter.sendMail({
    from: `"FDCUIC" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Mise à jour de votre dossier — FDCUIC',
    html: `
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
    `,
  });
};

module.exports = {
  envoyerEmailActivation,
  envoyerEmailSoumission,
  envoyerEmailStatut,
};