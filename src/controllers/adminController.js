const { AppelProjet, ProjetMobilite, User, Subvention, AppelAProjet } = require('../models/index');
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

    // ── RÉPARTITION PAR TYPE DE PROJET (tous les 4 types) ───
    const typesProjet = ['structuration', 'formation', 'evenementiel', 'mobilite'];
    const [appelsParType, mobiliteParType] = await Promise.all([
      AppelProjet.findAll({
        attributes: ['type_projet', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
        group: ['type_projet'],
        raw: true,
      }),
      ProjetMobilite.findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'total']],
        raw: true,
      })
    ]);
    const parTypeMap = {};
    typesProjet.forEach(t => { parTypeMap[t] = 0; });
    appelsParType.forEach(r => { if (r.type_projet && parTypeMap[r.type_projet] !== undefined) parTypeMap[r.type_projet] = parseInt(r.total); });
    // mobilite candidates count as 'mobilite' type
    parTypeMap['mobilite'] = (parTypeMap['mobilite'] || 0) + parseInt(mobiliteParType[0]?.total || 0);
    const parTypeProjet = Object.entries(parTypeMap).map(([type, total]) => ({ type, total }));

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
      par_type_projet: parTypeProjet,
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════
//  ACTIVITÉ RÉCENTE (flux chronologique)
// ════════════════════════════════════════════════════════════
const getActiviteRecente = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    const [recentesAppels, recentesMobilite] = await Promise.all([
      AppelProjet.findAll({
        include: [{ model: User, as: 'candidat', attributes: ['nom', 'prenom'] }],
        order: [['updatedAt', 'DESC']],
        limit: limit,
        raw: false
      }),
      ProjetMobilite.findAll({
        include: [{ model: User, as: 'candidat', attributes: ['nom', 'prenom'] }],
        order: [['updatedAt', 'DESC']],
        limit: limit,
        raw: false
      })
    ]);

    const activites = [
      ...recentesAppels.map(c => ({
        id: `appel-${c.id}`,
        type: 'appel',
        action: c.statut === 'soumis' ? 'soumis' : c.statut === 'accepte' ? 'accepte' : c.statut === 'rejete' ? 'rejete' : c.statut === 'en_examen' ? 'en_examen' : 'brouillon',
        statut: c.statut,
        nom: c.candidat ? `${c.candidat.prenom} ${c.candidat.nom}` : 'Anonyme',
        titre: c.titre_projet || c.titre || 'Dossier appel à projets',
        date: c.updatedAt,
      })),
      ...recentesMobilite.map(c => ({
        id: `mobilite-${c.id}`,
        type: 'mobilite',
        action: c.statut === 'soumis' ? 'soumis' : c.statut === 'accepte' ? 'accepte' : c.statut === 'rejete' ? 'rejete' : c.statut === 'en_examen' ? 'en_examen' : 'brouillon',
        statut: c.statut,
        nom: c.candidat ? `${c.candidat.prenom} ${c.candidat.nom}` : 'Anonyme',
        titre: c.intitule_projet || c.titre_projet || 'Dossier mobilité',
        date: c.updatedAt,
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json({ activites });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
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
    // req.file.path = URL Cloudinary complète, req.file.filename = public_id seulement
    const imageUrl = req.file.path || req.file.secure_url || req.file.filename;
    await campagne.update({ image_couverture: imageUrl });
    return res.status(200).json({ message: 'Image uploadée.', image: imageUrl, campagne: await campagne.reload() });
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
    console.error('ERREUR getCandidaturesMobilite:', error);
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

// ════════════════════════════════════════════════════════════
// CANDIDATURES (TOUS LES INSCRITS)
// ════════════════════════════════════════════════════════════
const getCandidatures = async (req, res) => {
  try {
    const { statut, search, page = 1, limit = 20 } = req.query;

    const conditions = [{ role: 'candidat' }];

    if (statut === 'actif') {
      conditions.push({ est_active: true });
      conditions.push({ [Op.or]: [{ est_desactive: false }, { est_desactive: { [Op.is]: null } }] });
      conditions.push({ [Op.or]: [{ est_supprime: false }, { est_supprime: { [Op.is]: null } }] });
    } else if (statut === 'en_attente') {
      conditions.push({ [Op.or]: [{ est_active: false }, { est_active: { [Op.is]: null } }] });
      conditions.push({ [Op.or]: [{ est_supprime: false }, { est_supprime: { [Op.is]: null } }] });
    } else if (statut === 'desactive') {
      conditions.push({ est_desactive: true });
    } else {
      conditions.push({ [Op.or]: [{ est_supprime: false }, { est_supprime: { [Op.is]: null } }] });
    }

    if (search) {
      conditions.push({
        [Op.or]: [
          { nom: { [Op.iLike]: `%${search}%` } },
          { prenom: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      });
    }

    const whereClause = { [Op.and]: conditions };

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'nom', 'prenom', 'email', 'telephone',
        'est_active', 'est_desactive', 'est_supprime',
        'derniere_connexion'
      ],
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const usersWithStatus = rows.map(user => {
      let statutCompte = 'en_attente';
      if (user.est_supprime) statutCompte = 'supprime';
      else if (user.est_desactive) statutCompte = 'desactive';
      else if (user.est_active) statutCompte = 'actif';

      return {
        ...user.toJSON(),
        statut_compte: statutCompte
      };
    });

    return res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      candidatures: usersWithStatus
    });
  } catch (error) {
    console.error('Erreur récupération candidatures:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getCandidatureById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: [
        'id', 'nom', 'prenom', 'email', 'telephone', 'role',
        'est_active', 'est_desactive', 'est_supprime',
        'derniere_connexion'
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    const nombreDossiers = await AppelProjet.count({ where: { user_id: id } });
    const nombreMobilites = await ProjetMobilite.count({ where: { user_id: id } });

    return res.status(200).json({
      ...user.toJSON(),
      statistiques: {
        nombre_dossiers_appels: nombreDossiers,
        nombre_dossiers_mobilite: nombreMobilites,
        a_deja_soumis: (nombreDossiers + nombreMobilites) > 0
      }
    });
  } catch (error) {
    console.error('Erreur détail candidature:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const desactiverCandidature = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    await user.update({ est_desactive: true });

    return res.status(200).json({ message: 'Compte désactivé avec succès', user });
  } catch (error) {
    console.error('Erreur désactivation:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const reactiverCandidature = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    await user.update({ est_desactive: false });

    return res.status(200).json({ message: 'Compte réactivé avec succès', user });
  } catch (error) {
    console.error('Erreur réactivation:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const supprimerCandidatureSoft = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    await user.update({
      est_supprime: true,
      est_desactive: true
    });

    return res.status(200).json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const renvoyerActivationCandidature = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    if (user.est_active) {
      return res.status(400).json({ message: 'Ce compte est déjà activé' });
    }

    const { envoyerEmailActivation } = require('../services/emailService');
    await envoyerEmailActivation(user.email, user.prenom, user.token_activation);

    return res.status(200).json({ message: 'Email d\'activation renvoyé avec succès' });
  } catch (error) {
    console.error('Erreur renvoi activation:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ════════════════════════════════════════════════════════════
// SOUMISSIONNAIRES
// ════════════════════════════════════════════════════════════
const getSoumissionnaires = async (req, res) => {
  try {
    const { search, statut, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const usersAvecDossiersAppels = await AppelProjet.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('user_id')), 'user_id']],
      raw: true
    });

    const usersAvecMobilite = await ProjetMobilite.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('user_id')), 'user_id']],
      raw: true
    });

    const idsAppels = usersAvecDossiersAppels.map(u => u.user_id);
    const idsMobilite = usersAvecMobilite.map(u => u.user_id);
    const idsUniques = [...new Set([...idsAppels, ...idsMobilite])];

    if (idsUniques.length === 0) {
      return res.status(200).json({ total: 0, page: 1, totalPages: 0, soumissionnaires: [] });
    }

    const whereClause = {
      id: { [Op.in]: idsUniques },
      est_supprime: false
    };

    if (search) {
      whereClause[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { prenom: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone'],
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const soumissionnairesData = await Promise.all(
      rows.map(async (user) => {
        const dossiers = await AppelProjet.findAll({
          where: { user_id: user.id },
          attributes: ['id', 'statut', 'type_projet', 'createdAt'],
          order: [['createdAt', 'DESC']]
        });

        const mobilites = await ProjetMobilite.findAll({
          where: { user_id: user.id },
          attributes: ['id', 'statut', 'createdAt'],
          order: [['createdAt', 'DESC']]
        });

        const dernierDossier = dossiers[0] || mobilites[0] || null;

        return {
          ...user.toJSON(),
          nombre_dossiers: dossiers.length,
          nombre_mobilites: mobilites.length,
          dernier_statut: dernierDossier ? dernierDossier.statut : null,
          derniere_soumission: dernierDossier ? dernierDossier.createdAt : null
        };
      })
    );

    let resultatsFinal = soumissionnairesData;
    if (statut) {
      resultatsFinal = soumissionnairesData.filter(s => s.dernier_statut === statut);
    }

    return res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      soumissionnaires: resultatsFinal
    });
  } catch (error) {
    console.error('Erreur récupération soumissionnaires:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getSoumissionnaireById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone']
    });

    if (!user) {
      return res.status(404).json({ message: 'Soumissionnaire non trouvé' });
    }

    const dossiers = await AppelProjet.findAll({
      where: { user_id: id },
      order: [['createdAt', 'DESC']]
    });

    const mobilites = await ProjetMobilite.findAll({
      where: { user_id: id },
      order: [['createdAt', 'DESC']]
    });

    const { Notification } = require('../models/index');
    let notifications = [];
    if (Notification) {
        notifications = await Notification.findAll({
        where: { user_id: id },
        order: [['createdAt', 'DESC']],
        limit: 20
        });
    }

    return res.status(200).json({
      infos: user,
      dossiers_appels: dossiers,
      dossiers_mobilite: mobilites,
      notifications,
      statistiques: {
        total_soumissions: dossiers.length + mobilites.length,
        acceptes: dossiers.filter(d => d.statut === 'accepte').length,
        rejetes: dossiers.filter(d => d.statut === 'rejete').length,
        en_examen: dossiers.filter(d => d.statut === 'en_examen').length,
        en_attente: dossiers.filter(d => d.statut === 'soumis').length
      }
    });
  } catch (error) {
    console.error('Erreur détail soumissionnaire:', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getDashboardStats,
  getActiviteRecente,
  getCampagnes, getCampagneById, modifierCampagne, supprimerCampagne, uploadImageCampagne,
  getCandidaturesAppel,
  getCandidaturesMobilite,
  rechercheCandidats,
  getCandidatures,
  getCandidatureById,
  desactiverCandidature,
  reactiverCandidature,
  supprimerCandidatureSoft,
  renvoyerActivationCandidature,
  getSoumissionnaires,
  getSoumissionnaireById
};