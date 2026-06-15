const { TypeProjet, ChampFormulaire, AppelProjet } = require('../models/index');

// GET admin — tous les types + stats
const listerTypes = async (req, res) => {
  try {
    const types = await TypeProjet.findAll({ order: [['code', 'ASC']] });

    const typesAvecStats = await Promise.all(
      types.map(async (type) => {
        const total = await AppelProjet.count({ where: { type_projet: type.code } });
        const soumis = await AppelProjet.count({ where: { type_projet: type.code, statut: 'soumis' } });
        const en_examen = await AppelProjet.count({ where: { type_projet: type.code, statut: 'en_examen' } });
        const accepte = await AppelProjet.count({ where: { type_projet: type.code, statut: 'accepte' } });
        const rejete = await AppelProjet.count({ where: { type_projet: type.code, statut: 'rejete' } });
        const taux_acceptation = total > 0 ? Math.round((accepte / total) * 100) : 0;

        return {
          ...type.toJSON(),
          stats: { total, soumis, en_examen, accepte, rejete, taux_acceptation },
        };
      })
    );

    return res.status(200).json({ types: typesAvecStats });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — champs d'un type de projet
const getChamps = async (req, res) => {
  try {
    const { code } = req.params;
    const champs = await ChampFormulaire.findAll({
      where: { type_projet: code },
      order: [['ordre', 'ASC']],
    });
    return res.status(200).json({ champs });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST admin — ajouter un champ à un type
const ajouterChamp = async (req, res) => {
  try {
    const { code } = req.params;
    const { nom_champ, label, type_champ, obligatoire, ordre } = req.body;

    if (!nom_champ || !label) {
      return res.status(400).json({ message: 'nom_champ et label sont obligatoires.' });
    }

    const champ = await ChampFormulaire.create({
      type_projet: code,
      nom_champ,
      label,
      type_champ,
      obligatoire,
      ordre,
    });

    return res.status(201).json({ message: 'Champ ajouté avec succès.', champ });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT admin — modifier un champ
const modifierChamp = async (req, res) => {
  try {
    const champ = await ChampFormulaire.findByPk(req.params.id);
    if (!champ) {
      return res.status(404).json({ message: 'Champ introuvable.' });
    }

    const { label, type_champ, obligatoire, actif, ordre } = req.body;
    await champ.update({ label, type_champ, obligatoire, actif, ordre });
    return res.status(200).json({ message: 'Champ mis à jour.', champ });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE admin — supprimer un champ
const supprimerChamp = async (req, res) => {
  try {
    const champ = await ChampFormulaire.findByPk(req.params.id);
    if (!champ) {
      return res.status(404).json({ message: 'Champ introuvable.' });
    }

    await champ.destroy();
    return res.status(200).json({ message: 'Champ supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerTypes,
  getChamps,
  ajouterChamp,
  modifierChamp,
  supprimerChamp,
};
