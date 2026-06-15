const { Notification } = require('../models');

// GET /api/notifications — Mes notifications (connecté)
const mesNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const notifications = await Notification.findAll({
      where: { user_id },
      order: [['date_envoi', 'DESC']]
    });

    return res.status(200).json({
      message: 'Liste de vos notifications.',
      data: notifications
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/notifications/:id/lu — Marquer comme lu
const marquerCommeLu = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable.' });
    }

    // Un utilisateur ne peut marquer que ses propres notifications
    if (notification.user_id !== user_id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    await notification.update({ lu: true });

    return res.status(200).json({
      message: 'Notification marquée comme lue.',
      data: notification
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/notifications/tout-lire — Tout marquer comme lu
const toutMarquerCommeLu = async (req, res) => {
  try {
    const user_id = req.user.id;

    await Notification.update(
      { lu: true },
      { where: { user_id, lu: false } }
    );

    return res.status(200).json({
      message: 'Toutes les notifications ont été marquées comme lues.'
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { mesNotifications, marquerCommeLu, toutMarquerCommeLu };