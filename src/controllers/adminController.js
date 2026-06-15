const { AppelProjet, ProjetMobilite, User, Subvention, AppelAProjet, ProgrammeMobilite } = require('../models/index');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ════════════════════════════════════════════════════════════
const getDashboardStats = async (req, res) => {
  try {

    // ── UTILISATEURS ──────────────────────────────────────
    const totalUsers = await User.count();
    const usersActifs = await User.count({ where: { est_active: true } });
    const usersByRole = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['role'],
      raw: true,
    });

    // ── APPELS PROJETS (candidatures) ─────────────────────
    const totalAppelsProjets = await AppelProjet.count();

    const appelsByStatut = await AppelProjet.findAll({
      attributes: ['statut', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['statut'],
      raw: true,
    });

    const appelsByType = await AppelProjet.findAll({
      attributes: ['type_projet', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['type_projet'],
      raw: true,
    });

    const appelsByRegion = await AppelProjet.findAll({
      attributes: ['region', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['region'],
      raw: true,
    });

    const appelsBySecteur = await AppelProjet.findAll({
      attributes: ['secteur_activite', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['secteur_activite'],
      raw: true,
    });

    // ── PROJETS MOBILITÉ (candidatures) ───────────────────
    const totalMobilite = await ProjetMobilite.count();

    const mobiliteByStatut = await ProjetMobilite.findAll({
      attributes: ['statut', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['statut'],
      raw: true,
    });

    const mobiliteByPays = await ProjetMobilite.findAll({
      attributes: ['pays_destination', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['pays_destination'],
      raw: true,
    });

    // ── SUBVENTIONS ───────────────────────────────────────
    const totalSubventions = await Subvention.count();
    const montantTotal = await Subvention.sum('montant');

    const subventionsByStatut = await Subvention.findAll({
      attributes: ['statut_paiement', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['statut_paiement'],
      raw: true,
    });

    // ── CAMPAGNES (appels à projets admin) ────────────────
    const totalCampagnes = await AppelAProjet.count();
    const campagnesOuvertes = await AppelAProjet.count({ where: { statut: 'ouvert' } });

    // ── TIMELINE MENSUELLE (12 derniers mois) ─────────────
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [appelsTimeline, mobiliteTimeline] = await Promise.all([
      AppelProjet.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'mois'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: twelveMonthsAgo } },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
        raw: true
      }),
      ProjetMobilite.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'mois'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: twelveMonthsAgo } },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
        raw: true
      })
    ]);

    // Merge both timelines into a single monthly series
    const monthMap = {};
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = d.toISOString().slice(0, 7); // "2026-01"
      monthMap[key] = { mois: key, appels: 0, mobilite: 0 };
    }
    appelsTimeline.forEach(r => {
      const key = new Date(r.mois).toISOString().slice(0, 7);
      if (monthMap[key]) monthMap[key].appels = parseInt(r.count);
    });
    mobiliteTimeline.forEach(r => {
      const key = new Date(r.mois).toISOString().slice(0, 7);
      if (monthMap[key]) monthMap[key].mobilite = parseInt(r.count);
    });
    const timelineMensuelle = Object.values(monthMap);

    // ── CANDIDATURES RÉCENTES GLOBALES (8 dernières) ──────
    const [recentesAppels, recentesMobilite] = await Promise.all([
      AppelProjet.findAll({
        include: [{ model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 8,
        raw: false
      }),
      ProjetMobilite.findAll({
        include: [{ model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 8,
        raw: false
      })
    ]);

    const recentesGlobales = [
      ...recentesAppels.map(c => ({
        id: c.id,
        type: 'appel',
        statut: c.statut,
        createdAt: c.createdAt,
        titre_projet: c.titre_projet || c.titre || null,
        candidat: c.candidat ? { nom: c.candidat.nom, prenom: c.candidat.prenom, email: c.candidat.email } : null,
      })),
      ...recentesMobilite.map(c => ({
        id: c.id,
        type: 'mobilite',
        statut: c.statut,
        createdAt: c.createdAt,
        titre_projet: c.titre_projet || c.intitule_projet || null,
        candidat: c.candidat ? { nom: c.candidat.nom, prenom: c.candidat.prenom, email: c.candidat.email } : null,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return res.status(200).json({
      utilisateurs: {
        total: totalUsers,
        actifs: usersActifs,
        inactifs: totalUsers - usersActifs,
        par_role: usersByRole,
      },
      appels_projets: {
        total: totalAppelsProjets,
        par_statut: appelsByStatut,
        par_type: appelsByType,
        par_region: appelsByRegion,
        par_secteur: appelsBySecteur,
      },
      mobilite: {
        total: totalMobilite,
        par_statut: mobiliteByStatut,
        par_pays: mobiliteByPays,
      },
      subventions: {
        total: totalSubventions,
        montant_total: montantTotal || 0,
        par_statut: subventionsByStatut,
      },
      campagnes: {
        total: totalCampagnes,
        ouvertes: campagnesOuvertes,
      },
      timeline_mensuelle: timelineMensuelle,
      recentes_globales: recentesGlobales,
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════
//  CAMPAGNES (Appels à Projets — Admin)
// ════════════════════════════════════════════════════════════
const getCampagnes = async (req, res) => {
  try {
    const campagnes = await AppelAProjet.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM appels_projets AS dossiers
              WHERE dossiers.appel_id = "AppelAProjet".id
            )`),
            'candidatures_count'
          ]
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ campagnes });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

const getCampagneById = async (req, res) => {
  try {
    const campagne = await AppelAProjet.findByPk(req.params.id, {
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM appels_projets AS dossiers
              WHERE dossiers.appel_id = "AppelAProjet".id
            )`),
            'candidatures_count'
          ]
        ]
      }
    });
    if (!campagne) {
      return res.status(404).json({ message: 'Appel à projets introuvable.' });
    }

    // 1. Fetch Timeline (candidatures groupées par date)
    const timelineData = await AppelProjet.findAll({
      where: { appel_id: campagne.id },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // 2. Fetch Recent Candidatures (5 dernières)
    const recentes = await AppelProjet.findAll({
      where: { appel_id: campagne.id },
      include: [{ model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    return res.status(200).json({ campagne, timeline: timelineData, recentes });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

const modifierCampagne = async (req, res) => {
  try {
    const campagne = await AppelAProjet.findByPk(req.params.id);
    if (!campagne) {
      return res.status(404).json({ message: 'Appel à projets introuvable.' });
    }

    // ── VERROUILLAGE : Un appel ouvert ne peut plus être modifié ──
    // Seule exception : on autorise le changement de statut vers "fermé"
    if (campagne.statut === 'ouvert') {
      const onlyClosing = Object.keys(req.body).length === 1 && req.body.statut === 'fermé';
      if (!onlyClosing) {
        return res.status(403).json({
          message: 'Cet appel à projets est ouvert et ne peut plus être modifié. Vous pouvez uniquement le clôturer.'
        });
      }
    }

    await campagne.update(req.body);
    return res.status(200).json({ message: 'Appel à projets mis à jour.', campagne });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

const supprimerCampagne = async (req, res) => {
  try {
    const campagne = await AppelAProjet.findByPk(req.params.id);
    if (!campagne) {
      return res.status(404).json({ message: 'Appel à projets introuvable.' });
    }

    // Vérifier s'il y a des candidatures
    const count = await AppelProjet.count({ where: { appel_id: campagne.id } });
    if (count > 0) {
      return res.status(400).json({ message: `Impossible de supprimer : ${count} candidatures y sont rattachées.` });
    }

    await campagne.destroy();
    return res.status(200).json({ message: 'Appel à projets supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

const uploadImageCampagne = async (req, res) => {
  try {
    const campagne = await AppelAProjet.findByPk(req.params.id);
    if (!campagne) {
      return res.status(404).json({ message: 'Appel à projets introuvable.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie.' });
    }
    await campagne.update({ image_couverture: req.file.filename });
    return res.status(200).json({ message: 'Image uploadée.', image: req.file.filename, campagne });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── Candidatures d'un appel à projets spécifique ──
const getCandidaturesAppel = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const statutFilter = req.query.statut || '';

    const where = { appel_id: id };
    if (statutFilter) where.statut = statutFilter;

    const include = [{
      model: User,
      as: 'candidat',
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone'],
      ...(search ? {
        where: {
          [Op.or]: [
            { nom: { [Op.iLike]: `%${search}%` } },
            { prenom: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ]
        }
      } : {})
    }];

    const { rows: candidatures, count: total } = await AppelProjet.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      candidatures,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════
//  PROGRAMME MOBILITÉ (Singleton — Admin)
// ════════════════════════════════════════════════════════════
const getProgrammeMobilite = async (req, res) => {
  try {
    // findOrCreate garantit qu'une seule entrée existe (id=1)
    const [programme] = await ProgrammeMobilite.findOrCreate({
      where: { id: 1 },
      defaults: {
        titre: 'Programme de Mobilité Internationale',
        description: 'Description du programme de mobilité...',
        statut: 'actif',
      }
    });

    // Compter les candidatures mobilité
    const totalCandidatures = await ProjetMobilite.count();

    // 1. Fetch Timeline (candidatures groupées par date)
    const timelineData = await ProjetMobilite.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // 2. Fetch Recent Candidatures (5 dernières)
    const recentes = await ProjetMobilite.findAll({
      include: [{ model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    return res.status(200).json({
      programme,
      totalCandidatures,
      timeline: timelineData,
      recentes
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

const modifierProgrammeMobilite = async (req, res) => {
  try {
    const [programme] = await ProgrammeMobilite.findOrCreate({
      where: { id: 1 },
      defaults: {
        titre: 'Programme de Mobilité Internationale',
        description: 'Description du programme de mobilité...',
        statut: 'actif',
      }
    });

    await programme.update(req.body);
    return res.status(200).json({ message: 'Programme de mobilité mis à jour.', programme });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

const uploadImageProgrammeMobilite = async (req, res) => {
  try {
    const [programme] = await ProgrammeMobilite.findOrCreate({
      where: { id: 1 },
      defaults: {
        titre: 'Programme de Mobilité Internationale',
        description: 'Description du programme de mobilité...',
        statut: 'actif',
      }
    });
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie.' });

    await programme.update({ image_couverture: req.file.filename });
    return res.status(200).json({ message: 'Image uploadée.', image: req.file.filename, programme });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── Candidatures mobilité (liste paginée) ──
const getCandidaturesMobilite = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const statutFilter = req.query.statut || '';

    const where = {};
    if (statutFilter) where.statut = statutFilter;

    const include = [{
      model: User,
      as: 'candidat',
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone'],
      ...(search ? {
        where: {
          [Op.or]: [
            { nom: { [Op.iLike]: `%${search}%` } },
            { prenom: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ]
        }
      } : {})
    }];

    const { rows: candidatures, count: total } = await ProjetMobilite.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      candidatures,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════
// RECHERCHE GLOBALE
// ════════════════════════════════════════════════════════════
const rechercheCandidats = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search || search.length < 2) {
      return res.status(200).json({ data: [] });
    }

    const term = `%${search}%`;

    const users = await User.findAll({
      where: {
        role: 'candidat',
        [Op.or]: [
          { nom: { [Op.iLike]: term } },
          { prenom: { [Op.iLike]: term } },
          { email: { [Op.iLike]: term } }
        ]
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'avatar'],
      limit: 10
    });

    const projets = await AppelProjet.findAll({
      where: {
        titre: { [Op.iLike]: term }
      },
      include: [{ model: User, as: 'candidat', attributes: ['nom', 'prenom'] }],
      attributes: ['id', 'titre', 'statut', 'type_projet'],
      limit: 10
    });

    return res.status(200).json({
      data: {
        users,
        projets
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la recherche.', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getCampagnes, getCampagneById, modifierCampagne, supprimerCampagne, uploadImageCampagne,
  getCandidaturesAppel,
  getProgrammeMobilite, modifierProgrammeMobilite, uploadImageProgrammeMobilite,
  getCandidaturesMobilite,
  rechercheCandidats
};