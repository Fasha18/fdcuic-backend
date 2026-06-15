const { User, AppelProjet, ProjetMobilite, AppelAProjet } = require('../models/index');

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

// GET admin — détail d'un candidat + tous ses dossiers
const detailCandidat = async (req, res) => {
  try {
    const candidat = await User.findByPk(req.params.id, {
      attributes: { exclude: ['mot_de_passe_hash', 'token_activation'] },
    });

    if (!candidat) {
      return res.status(404).json({ message: 'Candidat introuvable.' });
    }

    const dossiers_appel = await AppelProjet.findAll({
      where: { user_id: candidat.id },
      include: [{ model: AppelAProjet, as: 'appel' }],
      order: [['createdAt', 'DESC']],
    });

    const dossiers_mobilite = await ProjetMobilite.findAll({
      where: { user_id: candidat.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      candidat,
      dossiers_appel,
      dossiers_mobilite,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerCandidats,
  detailCandidat,
};
