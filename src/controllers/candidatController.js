const { User, AppelProjet, ProjetMobilite, AppelAProjet, Subvention, Notification } = require('../models/index');

// GET admin — liste paginée des candidats + stats dossiers
const listerCandidats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows: candidats, count: total } = await User.findAndCountAll({
      where: { role: 'candidat' },
      attributes: { exclude: ['mot_de_passe_hash', 'token_activation'] },
      order: [['id', 'DESC']],
      limit,
      offset,
    });

    const candidatsAvecStats = await Promise.all(
      candidats.map(async (candidat) => {
        const nb_dossiers_appel = await AppelProjet.count({ where: { user_id: candidat.id } });
        const nb_dossiers_mobilite = await ProjetMobilite.count({ where: { user_id: candidat.id } });
        return {
          ...candidat.toJSON(),
          nb_dossiers_appel,
          nb_dossiers_mobilite,
        };
      })
    );

    return res.status(200).json({
      candidats: candidatsAvecStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — détail d'un candidat + statistiques
const detailCandidat = async (req, res) => {
  try {
    const candidat = await User.findByPk(req.params.id, {
      attributes: { exclude: ['mot_de_passe_hash', 'token_activation'] },
    });

    if (!candidat) {
      return res.status(404).json({ message: 'Candidat introuvable.' });
    }

    // Statistiques globales
    const appels = await AppelProjet.findAll({ where: { user_id: candidat.id }, include: [{ model: Subvention, as: 'subvention' }] });
    const mobilites = await ProjetMobilite.findAll({ where: { user_id: candidat.id } });

    const tousDossiers = [...appels, ...mobilites];
    const total_dossiers = tousDossiers.length;
    const acceptes = tousDossiers.filter(d => d.statut === 'accepte').length;
    const en_examen = tousDossiers.filter(d => d.statut === 'en_examen').length;
    const rejetes = tousDossiers.filter(d => d.statut === 'rejete').length;
    const taux_acceptation = total_dossiers > 0 ? Math.round((acceptes / total_dossiers) * 100) : 0;
    
    // Calcul des subventions accordées
    let montant_subventions = 0;
    for (let dossier of appels) {
      if (dossier.statut === 'accepte' && dossier.subvention && dossier.subvention.montant) {
        montant_subventions += parseFloat(dossier.subvention.montant);
      }
    }

    return res.status(200).json({
      candidat,
      statistiques: {
        total_dossiers,
        acceptes,
        en_examen,
        rejetes,
        taux_acceptation,
        montant_subventions
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — appels d'un candidat
const getAppelsCandidat = async (req, res) => {
  try {
    const dossiers_appel = await AppelProjet.findAll({
      where: { user_id: req.params.id },
      include: [
        { model: AppelAProjet, as: 'appel' },
        { model: Subvention, as: 'subvention' }
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ candidatures: dossiers_appel, total: dossiers_appel.length });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — mobilités d'un candidat
const getMobilitesCandidat = async (req, res) => {
  try {
    const dossiers_mobilite = await ProjetMobilite.findAll({
      where: { user_id: req.params.id },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ candidatures: dossiers_mobilite, total: dossiers_mobilite.length });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — historique / timeline
const getHistoriqueCandidat = async (req, res) => {
  try {
    const candidat = await User.findByPk(req.params.id);
    if (!candidat) return res.status(404).json({ message: 'Introuvable' });

    let events = [];

    // Inscription (fallback si pas de createdAt)
    if (candidat.createdAt) {
      events.push({
        date: candidat.createdAt,
        type: 'inscription',
        description: 'Inscription sur la plateforme'
      });
    }

    const appels = await AppelProjet.findAll({ where: { user_id: candidat.id }, include: [{ model: AppelAProjet, as: 'appel' }] });
    const mobilites = await ProjetMobilite.findAll({ where: { user_id: candidat.id } });
    const notifications = await Notification.findAll({ where: { user_id: candidat.id } });

    appels.forEach(a => {
      events.push({
        date: a.createdAt,
        type: 'soumission_appel',
        description: `Soumission candidature appel : ${a.appel?.titre || 'Appel'}`,
        dossier_id: a.id
      });
      if (a.updatedAt && a.updatedAt.getTime() !== a.createdAt.getTime()) {
        events.push({
          date: a.updatedAt,
          type: 'statut_appel',
          description: `Mise à jour candidature appel (Statut: ${a.statut})`,
          dossier_id: a.id
        });
      }
    });

    mobilites.forEach(m => {
      events.push({
        date: m.createdAt,
        type: 'soumission_mobilite',
        description: `Soumission candidature mobilité : ${m.pays_destination}`,
        dossier_id: m.id
      });
      if (m.updatedAt && m.updatedAt.getTime() !== m.createdAt.getTime()) {
        events.push({
          date: m.updatedAt,
          type: 'statut_mobilite',
          description: `Mise à jour candidature mobilité (Statut: ${m.statut})`,
          dossier_id: m.id
        });
      }
    });

    notifications.forEach(n => {
      events.push({
        date: n.createdAt || n.date_envoi,
        type: 'notification',
        description: `Notification envoyée : ${n.message}`
      });
    });

    // Sort by date DESC
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — notifications
const getNotificationsCandidat = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.params.id },
      order: [['date_envoi', 'DESC']]
    });
    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE admin — supprimer un candidat et toutes ses données associées
const supprimerCandidat = async (req, res) => {
  try {
    const candidat = await User.findByPk(req.params.id);
    if (!candidat) {
      return res.status(404).json({ message: 'Candidat introuvable.' });
    }
    // Delete all candidatures associated to the user
    await AppelProjet.destroy({ where: { user_id: candidat.id } });
    await ProjetMobilite.destroy({ where: { user_id: candidat.id } });
    
    // Finally delete the user
    await candidat.destroy();
    
    return res.status(200).json({ message: 'Candidat supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerCandidats,
  detailCandidat,
  getAppelsCandidat,
  getMobilitesCandidat,
  getHistoriqueCandidat,
  getNotificationsCandidat,
  supprimerCandidat,
};
