const bcrypt = require('bcryptjs');
const { User } = require('../models/index');

// Mettre à jour les informations du profil
const updateProfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, prenom, telephone } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Mise à jour
    await user.update({
      nom: nom || user.nom,
      prenom: prenom || user.prenom,
      telephone: telephone || user.telephone,
    });

    return res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Erreur updateProfil:", error);
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Mettre à jour le mot de passe
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mot_de_passe_actuel, nouveau_mot_de_passe, confirmation_mot_de_passe } = req.body;

    if (!mot_de_passe_actuel || !nouveau_mot_de_passe || !confirmation_mot_de_passe) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    if (nouveau_mot_de_passe !== confirmation_mot_de_passe) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
    }

    if (nouveau_mot_de_passe.length < 8) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier l'ancien mot de passe
    const motDePasseValide = await bcrypt.compare(mot_de_passe_actuel, user.mot_de_passe_hash);
    if (!motDePasseValide) {
      return res.status(401).json({ message: "Le mot de passe actuel est incorrect." });
    }

    // Hacher le nouveau mot de passe
    const mot_de_passe_hash = await bcrypt.hash(nouveau_mot_de_passe, 12);

    await user.update({ mot_de_passe_hash });

    return res.status(200).json({ message: "Mot de passe mis à jour avec succès." });

  } catch (error) {
    console.error("Erreur updatePassword:", error);
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = {
  updateProfil,
  updatePassword
};
