const { SecteurActivite, AppelProjet } = require('../models/index');
const sequelize = require('../config/database');

// GET public — secteurs actifs (code + label uniquement)
const listerSecteursPublic = async (req, res) => {
  try {
    const secteurs = await SecteurActivite.findAll({
      where: { actif: true },
      attributes: ['code', 'nom'],
      order: [['nom', 'ASC']],
    });
    return res.status(200).json({ secteurs });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — tous les secteurs + stats
const listerSecteurs = async (req, res) => {
  try {
    const secteurs = await SecteurActivite.findAll({
      order: [['nom', 'ASC']],
    });

    // Stats par secteur
    const secteursAvecStats = await Promise.all(
      secteurs.map(async (secteur) => {
        const total_dossiers = await AppelProjet.count({
          where: { secteur_activite: secteur.code },
        });
        const total_candidats = await AppelProjet.count({
          col: 'user_id',
          distinct: true,
          where: { secteur_activite: secteur.code },
        });
        return {
          ...secteur.toJSON(),
          total_dossiers,
          total_candidats,
        };
      })
    );

    return res.status(200).json({ secteurs: secteursAvecStats });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST admin — créer un secteur
const creerSecteur = async (req, res) => {
  try {
    const { code, nom, description, icone } = req.body;

    if (!code || !nom) {
      return res.status(400).json({ message: 'Le code et le nom sont obligatoires.' });
    }

    if (nom.length < 3) {
      return res.status(400).json({ message: 'Le nom doit contenir au moins 3 caractères.' });
    }

    if (description && description.length < 10) {
      return res.status(400).json({ message: 'La description doit contenir au moins 10 caractères.' });
    }

    // Vérifier l'unicité du code
    const existant = await SecteurActivite.findOne({ where: { code } });
    if (existant) {
      return res.status(400).json({ message: `Le code "${code}" existe déjà.` });
    }

    const secteur = await SecteurActivite.create({ code, nom, description, icone });
    return res.status(201).json({ message: 'Secteur créé avec succès.', secteur });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT admin — modifier un secteur
const modifierSecteur = async (req, res) => {
  try {
    const secteur = await SecteurActivite.findByPk(req.params.id);
    if (!secteur) {
      return res.status(404).json({ message: 'Secteur introuvable.' });
    }

    const { nom, description, icone, actif } = req.body;

    if (nom && nom.length < 3) {
      return res.status(400).json({ message: 'Le nom doit contenir au moins 3 caractères.' });
    }

    if (description && description.length < 10) {
      return res.status(400).json({ message: 'La description doit contenir au moins 10 caractères.' });
    }

    await secteur.update({ nom, description, icone, actif });
    return res.status(200).json({ message: 'Secteur mis à jour.', secteur });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE admin — supprimer un secteur
const supprimerSecteur = async (req, res) => {
  try {
    const secteur = await SecteurActivite.findByPk(req.params.id);
    if (!secteur) {
      return res.status(404).json({ message: 'Secteur introuvable.' });
    }

    // Refuser si des dossiers utilisent ce secteur
    const count = await AppelProjet.count({ where: { secteur_activite: secteur.code } });
    if (count > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer : ${count} dossier(s) utilisent ce secteur.`,
      });
    }

    await secteur.destroy();
    return res.status(200).json({ message: 'Secteur supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerSecteursPublic,
  listerSecteurs,
  creerSecteur,
  modifierSecteur,
  supprimerSecteur,
};
