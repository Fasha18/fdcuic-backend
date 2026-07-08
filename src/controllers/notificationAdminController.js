const { Notification, User } = require('../models/index');

// GET admin — toutes les notifications avec infos user
const listerNotificationsAdmin = async (req, res) => {
  try {
    const where = {};
    if (req.query.lu !== undefined) {
      where.lu = req.query.lu === 'true';
    }

    const notifications = await Notification.findAll({
      where,
      include: [{
        model: User,
        as: 'destinataire',
        attributes: ['id', 'nom', 'prenom', 'email'],
      }],
      order: [['date_envoi', 'DESC']],
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST admin — envoyer une notification
const envoyerNotification = async (req, res) => {
  try {
    const { user_id, message, type } = req.body;
    const { envoyerEmailNotification } = require('../services/emailService');

    if (!message) {
      return res.status(400).json({ message: 'Le message est obligatoire.' });
    }

    if (user_id === 'tous') {
      // Envoyer à tous les candidats
      const candidats = await User.findAll({
        where: { role: 'candidat' },
        attributes: ['id', 'email', 'prenom'],
      });

      const notifications = candidats.map((c) => ({
        user_id: c.id,
        message,
        type: type || 'email',
      }));

      await Notification.bulkCreate(notifications);

      // Si c'est un email, on envoie à tous en arrière-plan
      if (type === 'email' || !type) {
        candidats.forEach(c => {
          envoyerEmailNotification(c.email, c.prenom, 'Nouvelle Notification — FDCUIC', `<p>${message}</p>`).catch(err => {
            console.error(`Erreur email pour ${c.email}:`, err.message);
          });
        });
      }

      return res.status(201).json({
        message: `Notification envoyée à ${candidats.length} candidat(s).`,
        total: candidats.length,
      });
    } else {
      // Envoyer à un user spécifique
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }

      const notification = await Notification.create({
        user_id,
        message,
        type: type || 'email',
      });

      // Envoyer l'email
      if (type === 'email' || !type) {
        envoyerEmailNotification(user.email, user.prenom, 'Nouvelle Notification — FDCUIC', `<p>${message}</p>`).catch(err => {
          console.error(`Erreur email pour ${user.email}:`, err.message);
        });
      }

      return res.status(201).json({
        message: 'Notification envoyée.',
        notification,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerNotificationsAdmin,
  envoyerNotification,
};
