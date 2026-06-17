const bcrypt = require('bcryptjs');
const { User, ActivityLog } = require('../models/index');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// GET admin — lister le personnel (evaluateur + admin) + count actions
const listerPersonnel = async (req, res) => {
  try {
    const personnel = await User.findAll({
      where: { role: { [Op.in]: ['evaluateur', 'admin'] } },
      attributes: { exclude: ['mot_de_passe_hash', 'token_activation'] },
      order: [['id', 'ASC']],
    });

    const personnelAvecStats = await Promise.all(
      personnel.map(async (user) => {
        const nb_actions = await ActivityLog.count({ where: { admin_id: user.id } });
        return { ...user.toJSON(), nb_actions };
      })
    );

    return res.status(200).json({ personnel: personnelAvecStats });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST admin — créer un membre du personnel
const creerPersonnel = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe || !role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    if (!['evaluateur', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Le rôle doit être evaluateur ou admin.' });
    }

    // Vérifier si l'email existe déjà
    const existant = await User.findOne({ where: { email } });
    if (existant) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 12);

    const user = await User.create({
      nom,
      prenom,
      email,
      mot_de_passe_hash,
      role,
      est_active: true,
      token_activation: null,
    });

    return res.status(201).json({
      message: 'Personnel créé avec succès.',
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        est_active: user.est_active,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT admin — modifier un membre du personnel
const modifierPersonnel = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const { nom, prenom, role, est_active } = req.body;
    await user.update({ nom, prenom, role, est_active });

    return res.status(200).json({
      message: 'Personnel mis à jour.',
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        est_active: user.est_active,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE admin — supprimer un membre du personnel
const supprimerPersonnel = async (req, res) => {
  try {
    // Refuser si c'est le compte connecté
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    await user.destroy();
    return res.status(200).json({ message: 'Personnel supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerPersonnel,
  creerPersonnel,
  modifierPersonnel,
  supprimerPersonnel,
};
