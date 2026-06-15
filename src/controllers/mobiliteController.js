const { ProjetMobilite, ProgrammeMobilite, User, Notification } = require('../models/index');
const path = require('path');

// ── ÉTAPE 1 : Informations générales ──────────────────────
const etape1 = async (req, res) => {
  try {
    const {
      nom_structure, discipline,
      date_depart, date_arrivee,
      pays_destination, region_destination,
    } = req.body;

    // Vérification des champs obligatoires
    if (!nom_structure || !discipline || !date_depart || !date_arrivee || !pays_destination || !region_destination) {
      return res.status(400).json({ message: 'Tous les champs de l\'étape 1 sont obligatoires.' });
    }

    if (new Date(date_arrivee) <= new Date(date_depart)) {
      return res.status(400).json({ message: 'La date d\'arrivée doit être postérieure à la date de départ.' });
    }

    // Vérifier si le candidat a déjà un brouillon en cours
    let projet = await ProjetMobilite.findOne({
      where: { user_id: req.user.id, statut: 'brouillon' }
    });

    if (projet) {
      // Mettre à jour le brouillon existant
      await projet.update({
        nom_structure, discipline,
        date_depart, date_arrivee,
        pays_destination, region_destination,
        etape_courante: 1,
      });
    } else {
      // Créer un nouveau brouillon
      projet = await ProjetMobilite.create({
        user_id: req.user.id,
        nom_structure, discipline,
        date_depart, date_arrivee,
        pays_destination, region_destination,
        etape_courante: 1,
        statut: 'brouillon',
      });
    }

    return res.status(200).json({
      message: 'Étape 1 enregistrée !',
      projet_id: projet.id,
      etape_courante: 1,
      prochaine_etape: 2,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ÉTAPE 2 : Contexte et objectifs ───────────────────────
const etape2 = async (req, res) => {
  try {
    const {
      presentation_succincte, opportunite,
      pertinence, objectifs_generaux, objectifs_specifiques,
    } = req.body;

    const projet = await ProjetMobilite.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    if (!presentation_succincte || !opportunite || !pertinence || !objectifs_generaux || !objectifs_specifiques) {
      return res.status(400).json({ message: 'Tous les champs de l\'étape 2 sont obligatoires.' });
    }

    await projet.update({
      presentation_succincte, opportunite,
      pertinence, objectifs_generaux, objectifs_specifiques,
      etape_courante: 2,
    });

    return res.status(200).json({
      message: 'Étape 2 enregistrée !',
      projet_id: projet.id,
      etape_courante: 2,
      prochaine_etape: 3,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ÉTAPE 3 : Programme et impact ─────────────────────────
const etape3 = async (req, res) => {
  try {
    const {
      programme_sejour_detaille_du_sejour, activites_prevues,
      resultats_attendus, impacts,
    } = req.body;

    const projet = await ProjetMobilite.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    if (!programme_sejour_detaille_du_sejour || !activites_prevues || !resultats_attendus || !impacts) {
      return res.status(400).json({ message: 'Tous les champs de l\'étape 3 sont obligatoires.' });
    }

    await projet.update({
      programme_sejour_detaille_du_sejour, activites_prevues,
      resultats_attendus, impacts,
      etape_courante: 3,
    });

    return res.status(200).json({
      message: 'Étape 3 enregistrée !',
      projet_id: projet.id,
      etape_courante: 3,
      prochaine_etape: 4,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ÉTAPE 4 : Documents et annexes ────────────────────────
const etape4 = async (req, res) => {
  try {
    const projet = await ProjetMobilite.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // Récupérer les fichiers uploadés
    const fichiers = req.files || {};
    const updates = { etape_courante: 4 };

    if (fichiers.doc_ninea)        updates.doc_ninea        = fichiers.doc_ninea[0].filename;
    if (fichiers.doc_recepisse)    updates.doc_recepisse    = fichiers.doc_recepisse[0].filename;
    if (fichiers.doc_invitation)   updates.doc_invitation   = fichiers.doc_invitation[0].filename;
    if (fichiers.doc_note_structure) updates.doc_note_structure = fichiers.doc_note_structure[0].filename;
    if (fichiers.doc_cv_portfolio) updates.doc_cv_portfolio = fichiers.doc_cv_portfolio[0].filename;
    if (fichiers.image_couverture) updates.image_couverture = fichiers.image_couverture[0].filename;

    const docNinea = updates.doc_ninea || projet.doc_ninea;
    const docRecepisse = updates.doc_recepisse || projet.doc_recepisse;
    const docInvitation = updates.doc_invitation || projet.doc_invitation;

    if (!docNinea || !docRecepisse || !docInvitation) {
      return res.status(400).json({ message: 'Le NINEA, le récépissé, et la lettre d\'invitation sont obligatoires.' });
    }

    await projet.update(updates);

    return res.status(200).json({
      message: 'Étape 4 enregistrée ! Documents uploadés avec succès.',
      projet_id: projet.id,
      fichiers_recus: Object.keys(fichiers),
      etape_courante: 4,
      prochaine_etape: 5,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ÉTAPE 5 : Récapitulatif + Soumettre ───────────────────
const soumettre = async (req, res) => {
  try {
    const projet = await ProjetMobilite.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: User, as: 'candidat', attributes: ['nom', 'prenom', 'email'] }],
    });

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    await projet.update({
      statut: 'soumis',
      etape_courante: 5,
    });

    return res.status(200).json({
      message: 'Dossier soumis avec succès ! Il passera en phase d\'examen.',
      projet,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── MES PROJETS MOBILITÉ ──────────────────────────────────
const mesProjets = async (req, res) => {
  try {
    const projets = await ProjetMobilite.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ projets });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── TOUS LES PROJETS MOBILITÉ (Admin) ─────────────────────
const tousLesProjets = async (req, res) => {
  try {
    const projets = await ProjetMobilite.findAll({
      include: [{
        model: User, as: 'candidat',
        attributes: ['id', 'nom', 'prenom', 'email'],
      }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ projets });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── CHANGER STATUT (Admin) ────────────────────────────────
const changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const projet = await ProjetMobilite.findByPk(req.params.id);

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    const statutsValides = ['brouillon', 'soumis', 'en_examen', 'accepte', 'rejete'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    if (projet.statut !== statut) {
      await projet.update({ statut });

      let msg = '';
      if (statut === 'en_examen') msg = `Votre candidature de mobilité "${projet.titre}" est actuellement en cours d'examen.`;
      else if (statut === 'accepte') msg = `Félicitations ! Votre projet de mobilité "${projet.titre}" a été retenu.`;
      else if (statut === 'rejete') msg = `Nous sommes au regret de vous informer que votre projet de mobilité "${projet.titre}" n'a pas été retenu.`;
      
      if (msg) {
        await Notification.create({
          user_id: projet.user_id,
          message: msg,
          type: 'in_app'
        });
      }
    }

    return res.status(200).json({
      message: `Statut mis à jour : ${statut}`,
      projet,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── PROGRAMME MOBILITÉ (Public) ───────────────────────────
const getProgrammeMobilitePublic = async (req, res) => {
  try {
    const programme = await ProgrammeMobilite.findOne({ where: { id: 1 } });
    if (!programme) {
      return res.status(404).json({ message: 'Programme mobilité non configuré.' });
    }
    return res.status(200).json({ programme });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── STATISTIQUES GLOBALES MOBILITÉ (Public) ────────────────
const getProgrammeMobiliteStats = async (req, res) => {
  try {
    const total = await ProjetMobilite.count();
    const en_analyse = await ProjetMobilite.count({ where: { statut: ['soumis', 'en_examen'] } });
    const valides = await ProjetMobilite.count({ where: { statut: 'accepte' } });
    const rejetes = await ProjetMobilite.count({ where: { statut: 'rejete' } });

    return res.status(200).json({
      stats: {
        total,
        en_analyse,
        valides,
        rejetes
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  etape1, etape2, etape3, etape4,
  soumettre, mesProjets, tousLesProjets, changerStatut, getProgrammeMobilitePublic, getProgrammeMobiliteStats
};