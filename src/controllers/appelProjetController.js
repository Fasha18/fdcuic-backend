const { AppelProjet, AppelAProjet, User, Notification } = require('../models/index');
const fs = require('fs');

// ── ÉTAPE 1 : Informations générales ──────────────────────
const etape1 = async (req, res) => {
  try {
    const {
      appel_id,
      prenom_nom_porteur,
      nom_structure,
      type_projet,
      secteur_activite,
      region,
      activite_entreprise,
      nature_projet,
    } = req.body;

    // Vérifier que l'appel existe et est ouvert
    const appel = await AppelAProjet.findByPk(appel_id);
    if (!appel) {
      return res.status(404).json({ message: 'Appel à projets introuvable.' });
    }
    if (appel.statut !== 'ouvert') {
      return res.status(400).json({ message: 'Cet appel à projets est fermé.' });
    }

    // Vérifier que tous les champs sont remplis
    if (!prenom_nom_porteur || !nom_structure || !type_projet ||
        !secteur_activite || !region || !activite_entreprise || !nature_projet) {
      return res.status(400).json({
        message: 'Tous les champs de l\'étape 1 sont obligatoires.',
        champs: [
          'prenom_nom_porteur',
          'nom_structure',
          'type_projet',
          'secteur_activite',
          'region',
          'activite_entreprise',
          'nature_projet',
        ],
      });
    }

    // Créer le brouillon
    const dossier = await AppelProjet.create({
      user_id: req.user.id,
      appel_id,
      prenom_nom_porteur,
      nom_structure,
      type_projet,
      secteur_activite,
      region,
      activite_entreprise,
      nature_projet,
      etape_courante: 1,
      statut: 'brouillon',
    });

    return res.status(201).json({
      message: 'Étape 1 enregistrée !',
      dossier_id: dossier.id,
      type_projet: dossier.type_projet,
      etape_courante: 1,
      prochaine_etape: 2,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ÉTAPE 2 : Détails et impacts ──────────────────────────
const etape2 = async (req, res) => {
  try {
    const {
      phase_ideation,
      phase_execution,
      objectifs_globaux,
      importance_territoire,
      impacts_economiques,
      potentiel_reussite,
      localisation,
      beneficiaires,
      plan_perennisation,
      description_produit,
      equipe,
    } = req.body;

    const dossier = await AppelProjet.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }

    // Vérifier que tous les champs sont remplis
    if (phase_ideation === undefined || phase_execution === undefined ||
        !objectifs_globaux || !importance_territoire || !impacts_economiques ||
        !potentiel_reussite || !localisation || !beneficiaires ||
        !plan_perennisation || !description_produit || !equipe) {
      return res.status(400).json({
        message: 'Tous les champs de l\'étape 2 sont obligatoires.',
      });
    }

    // Vérifier l'équipe — minimum 1, maximum 3
    if (!Array.isArray(equipe) || equipe.length < 1) {
      return res.status(400).json({
        message: 'L\'équipe doit contenir au moins 1 membre.',
      });
    }
    if (equipe.length > 3) {
      return res.status(400).json({
        message: 'L\'équipe ne peut pas dépasser 3 membres.',
      });
    }

    // Vérifier que chaque membre a tous ses champs
    const phoneRegex = /^(\+221|00221)?[7][0|5|6|7|8][0-9]{7}$/;
    for (let i = 0; i < equipe.length; i++) {
      const membre = equipe[i];
      if (!membre.poste || !membre.prenom || !membre.nom || !membre.telephone) {
        return res.status(400).json({
          message: `Membre ${i + 1} : tous les champs sont obligatoires (poste, prénom, nom, téléphone).`,
        });
      }
      if (!phoneRegex.test(membre.telephone)) {
        return res.status(400).json({
          message: `Membre ${i + 1} : Numéro de téléphone sénégalais invalide (ex: 771234567).`,
        });
      }
    }

    await dossier.update({
      phase_ideation,
      phase_execution,
      objectifs_globaux,
      importance_territoire,
      impacts_economiques,
      potentiel_reussite,
      localisation,
      beneficiaires,
      plan_perennisation,
      description_produit,
      equipe,
      etape_courante: 2,
    });

    return res.status(200).json({
      message: 'Étape 2 enregistrée !',
      dossier_id: dossier.id,
      etape_courante: 2,
      prochaine_etape: 3,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ÉTAPE 3 : Documents et fichiers ───────────────────────
const etape3 = async (req, res) => {
  try {
    const dossier = await AppelProjet.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }

    const fichiers = req.files || {};
    const updates = { etape_courante: 3 };

    // Documents communs aux 3 types
    if (fichiers.doc_ninea_recepisse)
      updates.doc_ninea_recepisse = fichiers.doc_ninea_recepisse[0].filename;
    if (fichiers.doc_cni_passeport)
      updates.doc_cni_passeport = fichiers.doc_cni_passeport[0].filename;
    if (fichiers.doc_plan_action)
      updates.doc_plan_action = fichiers.doc_plan_action[0].filename;
    if (fichiers.doc_photo_prototype)
      updates.doc_photo_prototype = fichiers.doc_photo_prototype[0].filename;

    // Formation + Événementiel
    if (dossier.type_projet === 'formation' ||
        dossier.type_projet === 'evenementiel') {
      if (fichiers.doc_budget)
        updates.doc_budget = fichiers.doc_budget[0].filename;
    }

    // Structuration uniquement
    if (dossier.type_projet === 'structuration') {
      if (fichiers.doc_analyse_financiere)
        updates.doc_analyse_financiere = fichiers.doc_analyse_financiere[0].filename;
      if (fichiers.doc_business_model)
        updates.doc_business_model = fichiers.doc_business_model[0].filename;
    }

    // Vérifier que les documents obligatoires sont fournis
    const docNinea = updates.doc_ninea_recepisse || dossier.doc_ninea_recepisse;
    const docCni   = updates.doc_cni_passeport   || dossier.doc_cni_passeport;
    const docBudget = updates.doc_budget || dossier.doc_budget;
    const docAnalyse = updates.doc_analyse_financiere || dossier.doc_analyse_financiere;
    const docBusiness = updates.doc_business_model || dossier.doc_business_model;

    if (!docNinea || !docCni) {
      return res.status(400).json({
        message: 'Les documents NINEA/Récépissé et CNI/Passeport sont obligatoires.',
      });
    }

    if ((dossier.type_projet === 'formation' || dossier.type_projet === 'evenementiel') && !docBudget) {
      return res.status(400).json({ message: 'Le document Budget prévisionnel est obligatoire pour ce type de projet.' });
    }

    if (dossier.type_projet === 'structuration' && (!docAnalyse || !docBusiness)) {
      return res.status(400).json({ message: 'L\'Analyse financière et le Business Model Canvas sont obligatoires pour la Structuration.' });
    }

    await dossier.update(updates);

    return res.status(200).json({
      message: 'Étape 3 enregistrée ! Documents uploadés.',
      dossier_id: dossier.id,
      fichiers_recus: Object.keys(fichiers),
      etape_courante: 3,
      prochaine_etape: 4,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── ÉTAPE 4 : Récapitulatif + Soumettre ───────────────────
const soumettre = async (req, res) => {
  try {
    const dossier = await AppelProjet.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: AppelAProjet, as: 'appel' },
        { model: User, as: 'candidat', attributes: ['nom', 'prenom', 'email'] },
      ],
    });
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }

    // Vérifier que toutes les étapes sont complètes
    const champsObligatoires = [
      'nom_structure', 'type_projet', 'secteur_activite', 'region',
      'activite_entreprise', 'nature_projet',
      'objectifs_globaux', 'importance_territoire', 'impacts_economiques',
      'potentiel_reussite', 'localisation', 'beneficiaires',
      'plan_perennisation', 'description_produit', 'equipe',
      'doc_ninea_recepisse', 'doc_cni_passeport',
      'doc_plan_action', 'doc_photo_prototype',
    ];

    const champsManquants = champsObligatoires.filter(c => !dossier[c]);
    if (champsManquants.length > 0) {
      return res.status(400).json({
        message: 'Dossier incomplet. Veuillez remplir toutes les étapes.',
        champs_manquants: champsManquants,
      });
    }

    await dossier.update({
      statut: 'soumis',
      etape_courante: 4,
    });

    const { envoyerNotificationStatut } = require('../services/notificationService');
    try {
      await envoyerNotificationStatut(
        dossier.user_id,
        {
          nom_structure: dossier.nom_structure,
          titre_appel: dossier.appel?.titre || 'Appel à projet',
          type: 'appel'
        },
        'soumis'
      );
    } catch (notifError) {
      console.error('Erreur notification:', notifError.message);
    }

    return res.status(200).json({
      message: 'Dossier soumis avec succès ! Il passera en phase d\'examen.',
      dossier,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── MES DOSSIERS ──────────────────────────────────────────
const mesDossiers = async (req, res) => {
  try {
    const dossiers = await AppelProjet.findAll({
      where: { user_id: req.user.id },
      include: [{ model: AppelAProjet, as: 'appel' }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ dossiers });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── TOUS LES DOSSIERS (Admin) ─────────────────────────────
const tousDossiers = async (req, res) => {
  try {
    const dossiers = await AppelProjet.findAll({
      include: [
        { model: AppelAProjet, as: 'appel' },
        { model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ dossiers });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── CHANGER STATUT (Admin) ────────────────────────────────
const changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const dossier = await AppelProjet.findByPk(req.params.id, {
      include: [{ model: AppelAProjet, as: 'appel' }]
    });
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }
    const statutsValides = ['brouillon', 'soumis', 'en_examen', 'accepte', 'rejete'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }
    
    // Si le statut change, on notifie l'utilisateur
    if (dossier.statut !== statut) {
      await dossier.update({ statut });

      const { envoyerNotificationStatut } = require('../services/notificationService');
      try {
        await envoyerNotificationStatut(
          dossier.user_id,
          {
            nom_structure: dossier.nom_structure,
            titre_appel: dossier.appel?.titre || 'Appel à projet',
            type: 'appel'
          },
          statut
        );
      } catch (notifError) {
        console.error('Erreur notification:', notifError.message);
      }
    }

    return res.status(200).json({
      message: `Statut mis à jour : ${statut}`,
      dossier,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── SUPPRIMER DOSSIER (Admin) ──────────────────────────────
const supprimerDossier = async (req, res) => {
  try {
    const dossier = await AppelProjet.findByPk(req.params.id);
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }
    await dossier.destroy();
    return res.status(200).json({ message: 'Dossier supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  etape1, etape2, etape3,
  soumettre, mesDossiers,
  tousDossiers, changerStatut, supprimerDossier
};