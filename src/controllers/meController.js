const { User } = require('../models/index');
const bcrypt = require('bcrypt');

// 1. Récupérer le profil
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['mot_de_passe_hash', 'reset_token', 'reset_token_expiry', 'token_activation'] }
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 2. Mettre à jour le profil (nom, prenom, telephone, identité)
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, type_piece_identite, numero_piece_identite, date_naissance } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (telephone !== undefined) user.telephone = telephone;
    if (type_piece_identite !== undefined) user.type_piece_identite = type_piece_identite;
    if (numero_piece_identite !== undefined) user.numero_piece_identite = numero_piece_identite;
    if (date_naissance !== undefined) user.date_naissance = date_naissance;

    await user.save();
    res.json({ 
      message: 'Profil mis à jour avec succès', 
      user: { 
        nom: user.nom, 
        prenom: user.prenom, 
        telephone: user.telephone,
        type_piece_identite: user.type_piece_identite,
        numero_piece_identite: user.numero_piece_identite,
        date_naissance: user.date_naissance
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

// 3. Upload de l'avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni' });
    
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    user.avatar_url = req.file.path; // URL Cloudinary
    await user.save();

    res.json({ message: 'Avatar mis à jour', avatar_url: user.avatar_url });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'upload', error: error.message });
  }
};

// 4. Changement de mot de passe
exports.updatePassword = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse, confirmationNouveauMotDePasse } = req.body;
    
    if (!ancienMotDePasse || !nouveauMotDePasse || !confirmationNouveauMotDePasse) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    if (nouveauMotDePasse !== confirmationNouveauMotDePasse) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }
    
    if (nouveauMotDePasse.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const isValid = await bcrypt.compare(ancienMotDePasse, user.mot_de_passe_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'L\'ancien mot de passe est incorrect' });
    }

    user.mot_de_passe_hash = await bcrypt.hash(nouveauMotDePasse, 10);
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe', error: error.message });
  }
};

// 5. Mise à jour des préférences (notifications_email)
exports.updatePreferences = async (req, res) => {
  try {
    const { notifications_email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (typeof notifications_email === 'boolean') {
      user.notifications_email = notifications_email;
      await user.save();
    }

    res.json({ message: 'Préférences mises à jour', notifications_email: user.notifications_email });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des préférences', error: error.message });
  }
};
