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

    // Vérifier que le candidat n'a pas déjà un dossier pour cet appel
    const existingDossier = await AppelProjet.findOne({
      where: { user_id: req.user.id, appel_id }
    });
    if (existingDossier) {
      return res.status(400).json({ 
        message: 'Vous avez déjà une candidature (en cours ou soumise) pour cet appel à projets. Veuillez consulter "Mes Dossiers".' 
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

    let docsSoumis = dossier.documents_soumis ? [...dossier.documents_soumis] : [];
    const fichiers = req.files || []; // upload.any() donne un tableau

    for (const file of fichiers) {
      const existingIndex = docsSoumis.findIndex(d => d.nom_document === file.fieldname);
      const docEntry = {
        nom_document: file.fieldname,
        label: file.originalname,
        chemin_fichier: file.path
      };

      if (existingIndex >= 0) {
        docsSoumis[existingIndex] = docEntry;
      } else {
        docsSoumis.push(docEntry);
      }
    }

    await dossier.update({ 
      etape_courante: 3,
      documents_soumis: docsSoumis
    });

    return res.status(200).json({
      message: 'Étape 3 enregistrée ! Documents uploadés.',
      dossier_id: dossier.id,
      fichiers_recus: fichiers.map(f => f.fieldname),
      etape_courante: 3,
      prochaine_etape: 4,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── UPLOAD DOCUMENT UNIQUE (Étape 3) ────────────────────────
const uploadDocumentUnique = async (req, res) => {
  try {
    const dossier = await AppelProjet.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier introuvable.' });
    }

    const { docType } = req.body;
    const fichier = req.file;

    if (!docType || !fichier) {
      return res.status(400).json({ message: 'Type de document et fichier manquants.' });
    }

    let docsSoumis = dossier.documents_soumis ? [...dossier.documents_soumis] : [];
    const existingIndex = docsSoumis.findIndex(d => d.nom_document === docType);
    const docEntry = {
      nom_document: docType,
      label: fichier.originalname,
      chemin_fichier: fichier.path
    };

    if (existingIndex >= 0) {
      docsSoumis[existingIndex] = docEntry;
    } else {
      docsSoumis.push(docEntry);
    }

    await dossier.update({ 
      documents_soumis: docsSoumis
    });

    return res.status(200).json({
      message: 'Document uploadé avec succès.',
      dossier_id: dossier.id,
      docType: docType,
      path: fichier.path
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
    ];

    const champsManquants = champsObligatoires.filter(c => !dossier[c]);
    if (champsManquants.length > 0) {
      return res.status(400).json({
        message: 'Dossier incomplet. Veuillez remplir toutes les étapes.',
        champs_manquants: champsManquants,
      });
    }

    // Vérification statique des documents
    const docsSoumis = dossier.documents_soumis || [];
    const typeProjet = dossier.type_projet;
    
    let requiredDocs = [
      'doc_ninea_recepisse',
      'doc_cni_passeport',
      'doc_plan_action',
      'doc_photo_prototype'
    ];

    if (typeProjet === 'formation' || typeProjet === 'evenementiel') {
      requiredDocs.push('doc_budget');
    } else if (typeProjet === 'structuration') {
      requiredDocs.push('doc_analyse_financiere', 'doc_business_model');
    }

    const manquants = requiredDocs.filter(reqDoc => 
      !docsSoumis.some(d => d.nom_document === reqDoc)
    );

    console.log('[DEBUG SOUMETTRE]', {
      dossierId: dossier.id,
      typeProjet: typeProjet,
      docsSoumisKeys: docsSoumis.map(d => d.nom_document),
      requiredDocs: requiredDocs,
      manquants: manquants
    });

    if (manquants.length > 0) {
      return res.status(400).json({
        message: 'Dossier incomplet. Des documents obligatoires manquent.',
        documents_manquants: manquants
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
  etape1,
  etape2,
  etape3,
  uploadDocumentUnique,
  soumettre, mesDossiers,
  tousDossiers, changerStatut, supprimerDossier
};