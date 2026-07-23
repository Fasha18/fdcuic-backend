const { AppelProjet, AppelAProjet, User, Notification, DocumentModele, TypeProjet } = require('../models/index');
const { envoyerEmailNotification } = require('../services/emailService');

// ════════════════════════════════════════════════════════════
// STATUTS VALIDES pour le workflow d'évaluation
// ════════════════════════════════════════════════════════════
const STATUTS_VALIDES = [
  'brouillon', 'soumis',
  'en_examen_conformite', 'non_conforme',
  'en_evaluation_contenu', 'accepte', 'rejete'
];

const STATUTS_FINAUX = ['non_conforme', 'accepte', 'rejete'];

// ════════════════════════════════════════════════════════════
// HELPER — créer une notification in-app pour le candidat
// ════════════════════════════════════════════════════════════
const notifierCandidat = async (userId, message) => {
  try {
    await Notification.create({
      user_id: userId,
      message,
      type: 'in_app',
      lu: false,
    });
  } catch (err) {
    console.error('Erreur création notification:', err.message);
  }
};

// ════════════════════════════════════════════════════════════
// GET /api/admin/dossiers/:id — Détail complet d'un dossier
// ════════════════════════════════════════════════════════════
const getDossierById = async (req, res) => {
  try {
    const { id } = req.params;

    const dossier = await AppelProjet.findByPk(id, {
      include: [
        {
          model: User,
          as: 'candidat',
          attributes: ['id', 'prenom', 'nom', 'email', 'telephone'],
        },
        {
          model: AppelAProjet,
          as: 'appel',
          attributes: ['id', 'titre', 'type_projet', 'date_debut', 'date_fin', 'statut'],
        },
      ],
    });

    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }

    // Récupérer l'évaluateur si présent
    let evaluateur = null;
    if (dossier.evalue_par) {
      evaluateur = await User.findByPk(dossier.evalue_par, {
        attributes: ['id', 'prenom', 'nom', 'email'],
      });
    }

    // Récupérer les documents modèles pour ce type de projet
    let documentsModeles = [];
    if (dossier.appel && dossier.appel.type_projet) {
      // Chercher le type de projet par code pour récupérer ses documents modèles
      const typeProjet = await TypeProjet.findOne({
        where: { code: dossier.appel.type_projet },
        include: [
          {
            model: DocumentModele,
            as: 'documents_modeles',
            attributes: ['id', 'nom_document', 'url_fichier', 'type_fichier'],
          },
        ],
      });
      if (typeProjet) {
        documentsModeles = typeProjet.documents_modeles || [];
      }
    }

    return res.status(200).json({
      dossier,
      evaluateur,
      documentsModeles,
    });
  } catch (error) {
    console.error('Erreur getDossierById:', error.message);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════
// PATCH /api/admin/dossiers/:id/conformite — Étape 1
// body: { conforme: boolean, commentaire?: string }
// ════════════════════════════════════════════════════════════
const evaluerConformite = async (req, res) => {
  try {
    const { id } = req.params;
    const { conforme, commentaire } = req.body;

    if (conforme === undefined || conforme === null) {
      return res.status(400).json({ message: 'Le champ "conforme" (boolean) est obligatoire.' });
    }

    const dossier = await AppelProjet.findByPk(id, {
      include: [
        { model: User, as: 'candidat', attributes: ['id', 'prenom', 'nom', 'email'] },
        { model: AppelAProjet, as: 'appel', attributes: ['id', 'titre'] },
      ],
    });

    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }

    // Vérifier que le dossier est dans un statut permettant l'évaluation de conformité
    if (!['soumis', 'en_examen_conformite'].includes(dossier.statut)) {
      return res.status(400).json({
        message: `Impossible d'évaluer la conformité d'un dossier avec le statut "${dossier.statut}".`
      });
    }

    if (!conforme && (!commentaire || commentaire.trim() === '')) {
      return res.status(400).json({
        message: 'Un commentaire est obligatoire pour justifier la non-conformité.'
      });
    }

    const nouveauStatut = conforme ? 'en_evaluation_contenu' : 'non_conforme';

    await dossier.update({
      statut: nouveauStatut,
      commentaire_conformite: conforme ? null : commentaire.trim(),
    });

    // Notification au candidat
    const nomStructure = dossier.nom_structure || 'votre dossier';
    const nomAppel = dossier.appel?.titre || "l'appel à projets";

    const candidat = await User.findByPk(dossier.user_id, { attributes: ['id', 'prenom', 'nom', 'email'] });

    if (conforme) {
      const msgInApp = `✅ Votre dossier "${nomStructure}" a passé la vérification de conformité administrative. Il entre maintenant en phase d'évaluation du contenu pour l'appel "${nomAppel}".`;
      await notifierCandidat(dossier.user_id, msgInApp);

      // Email Brevo
      if (candidat) {
        const sujet = '🔍 Conformité validée — FDCUIC';
        const contenu = `Bonjour ${candidat.prenom},<br><br>
Votre dossier <strong>${nomStructure}</strong> soumis pour l'appel <strong>${nomAppel}</strong> a <strong>passé avec succès</strong> la vérification de conformité administrative.<br><br>
Votre dossier entre maintenant en phase d'<strong>évaluation du contenu</strong>. Vous serez notifié dès qu'une décision sera prise.<br><br>
Cordialement,<br>L'équipe FDCUIC`;
        envoyerEmailNotification(candidat.email, candidat.prenom, sujet, contenu).catch(err =>
          console.error('Erreur email conformité (conforme):', err.message)
        );
      }
    } else {
      const msgInApp = `❌ Votre dossier "${nomStructure}" n'a pas satisfait aux critères de conformité administrative. Motif : ${commentaire.trim()}. Pour plus d'informations, contactez l'équipe FDCUIC.`;
      await notifierCandidat(dossier.user_id, msgInApp);

      // Email Brevo
      if (candidat) {
        const sujet = '❌ Dossier non conforme — FDCUIC';
        const contenu = `Bonjour ${candidat.prenom},<br><br>
Après examen, votre dossier <strong>${nomStructure}</strong> soumis pour l'appel <strong>${nomAppel}</strong> ne satisfait pas aux critères de conformité administrative.<br><br>
<strong>Motif :</strong> ${commentaire.trim()}<br><br>
Pour toute question, contactez notre équipe à <a href="mailto:contact@fdcuic.sn">contact@fdcuic.sn</a>.<br><br>
Cordialement,<br>L'équipe FDCUIC`;
        envoyerEmailNotification(candidat.email, candidat.prenom, sujet, contenu).catch(err =>
          console.error('Erreur email conformité (non conforme):', err.message)
        );
      }
    }

    return res.status(200).json({
      message: conforme
        ? 'Dossier déclaré conforme. Il passe en évaluation du contenu.'
        : 'Dossier déclaré non conforme. Candidat notifié.',
      dossier,
    });
  } catch (error) {
    console.error('Erreur evaluerConformite:', error.message);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════
// PATCH /api/admin/dossiers/:id/evaluation — Étape 2
// body: { decision: 'accepte' | 'rejete', commentaire?: string }
// ════════════════════════════════════════════════════════════
const evaluerContenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, commentaire } = req.body;

    if (!decision || !['accepte', 'rejete'].includes(decision)) {
      return res.status(400).json({
        message: 'Le champ "decision" est obligatoire et doit être "accepte" ou "rejete".'
      });
    }

    const dossier = await AppelProjet.findByPk(id, {
      include: [
        { model: User, as: 'candidat', attributes: ['id', 'prenom', 'nom', 'email'] },
        { model: AppelAProjet, as: 'appel', attributes: ['id', 'titre'] },
      ],
    });

    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }

    if (dossier.statut !== 'en_evaluation_contenu') {
      return res.status(400).json({
        message: `L'évaluation du contenu n'est possible que pour un dossier en statut "en_evaluation_contenu". Statut actuel : "${dossier.statut}".`
      });
    }

    if (decision === 'rejete' && (!commentaire || commentaire.trim() === '')) {
      return res.status(400).json({
        message: 'Un commentaire est obligatoire pour justifier un rejet.'
      });
    }

    await dossier.update({
      statut: decision,
      commentaire_evaluation: decision === 'rejete' ? commentaire.trim() : (commentaire?.trim() || null),
      evalue_par: req.user.id,
      date_evaluation: new Date(),
    });

    // Notification au candidat
    const nomStructure = dossier.nom_structure || 'votre dossier';
    const nomAppel = dossier.appel?.titre || "l'appel à projets";
    const candidat2 = await User.findByPk(dossier.user_id, { attributes: ['id', 'prenom', 'nom', 'email'] });

    if (decision === 'accepte') {
      const msgInApp = `🎉 Félicitations ! Votre dossier "${nomStructure}" a été accepté dans le cadre de l'appel "${nomAppel}". Notre équipe vous contactera prochainement pour les modalités.`;
      await notifierCandidat(dossier.user_id, msgInApp);

      // Email Brevo
      if (candidat2) {
        const sujet = '🎉 Félicitations ! Votre dossier a été accepté — FDCUIC';
        const contenu = `Bonjour ${candidat2.prenom},<br><br>
Nous avons le plaisir de vous informer que votre dossier <strong>${nomStructure}</strong> soumis pour l'appel <strong>${nomAppel}</strong> a été <strong style="color:#16a34a;">accepté</strong> par le FDCUIC !<br><br>
Notre équipe vous contactera très prochainement pour vous communiquer les modalités de financement et les prochaines étapes.<br><br>
Félicitations et bienvenue dans la famille FDCUIC !<br><br>
Cordialement,<br>L'équipe FDCUIC`;
        envoyerEmailNotification(candidat2.email, candidat2.prenom, sujet, contenu).catch(err =>
          console.error('Erreur email évaluation (accepté):', err.message)
        );
      }
    } else {
      const msgInApp = `📋 Nous regrettons de vous informer que votre dossier "${nomStructure}" n'a pas été retenu pour l'appel "${nomAppel}". Motif : ${commentaire.trim()}.`;
      await notifierCandidat(dossier.user_id, msgInApp);

      // Email Brevo
      if (candidat2) {
        const sujet = '📋 Résultat de votre candidature — FDCUIC';
        const contenu = `Bonjour ${candidat2.prenom},<br><br>
Après examen approfondi de votre dossier <strong>${nomStructure}</strong> soumis pour l'appel <strong>${nomAppel}</strong>, nous regrettons de vous informer que votre candidature n'a pas été retenue.<br><br>
<strong>Motif :</strong> ${commentaire.trim()}<br><br>
Nous vous encourageons à améliorer votre dossier et à postuler lors des prochains appels à projets.<br><br>
Pour toute question, contactez-nous à <a href="mailto:contact@fdcuic.sn">contact@fdcuic.sn</a>.<br><br>
Cordialement,<br>L'équipe FDCUIC`;
        envoyerEmailNotification(candidat2.email, candidat2.prenom, sujet, contenu).catch(err =>
          console.error('Erreur email évaluation (rejeté):', err.message)
        );
      }
    }

    return res.status(200).json({
      message: decision === 'accepte'
        ? 'Dossier accepté avec succès. Candidat notifié.'
        : 'Dossier rejeté. Candidat notifié.',
      dossier,
    });
  } catch (error) {
    console.error('Erreur evaluerContenu:', error.message);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  getDossierById,
  evaluerConformite,
  evaluerContenu,
};
