const { ActivityLog, User } = require('../models/index');
const { Op } = require('sequelize');

// GET admin — liste paginée du journal d'activité
const listerJournal = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;

    const where = {};

    // Filtre par action
    if (req.query.action) {
      where.action = req.query.action;
    }

    // Filtre par date_debut et date_fin
    if (req.query.date_debut || req.query.date_fin) {
      where.createdAt = {};
      if (req.query.date_debut) {
        where.createdAt[Op.gte] = new Date(req.query.date_debut);
      }
      if (req.query.date_fin) {
        where.createdAt[Op.lte] = new Date(req.query.date_fin + 'T23:59:59');
      }
    }

    const { rows: logs, count: total } = await ActivityLog.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'admin',
        attributes: ['id', 'nom', 'prenom', 'email'],
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// Fonction utilitaire (pas une route) — à appeler dans d'autres contrôleurs
const logAction = async (admin_id, action, cible_type, cible_id, details = null) => {
  try {
    await ActivityLog.create({ admin_id, action, cible_type, cible_id, details });
  } catch (error) {
    console.error('Erreur logAction:', error.message);
  }
};

module.exports = {
  listerJournal,
  logAction,
};
