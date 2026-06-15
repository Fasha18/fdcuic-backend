const { PageLegale } = require('../models/index');

// GET public — récupérer une page légale par type
const getPageLegale = async (req, res) => {
  try {
    const { type } = req.params;
    const typesValides = ['mentions_legales', 'cgu', 'confidentialite'];

    if (!typesValides.includes(type)) {
      return res.status(400).json({ message: 'Type de page invalide.' });
    }

    const page = await PageLegale.findOne({ where: { type } });
    if (!page) {
      return res.status(404).json({ message: 'Page non trouvée.' });
    }

    return res.status(200).json({ page });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT admin — modifier une page légale
const modifierPageLegale = async (req, res) => {
  try {
    const { type } = req.params;
    const { contenu } = req.body;
    const typesValides = ['mentions_legales', 'cgu', 'confidentialite'];

    if (!typesValides.includes(type)) {
      return res.status(400).json({ message: 'Type de page invalide.' });
    }

    const [page, created] = await PageLegale.findOrCreate({
      where: { type },
      defaults: { contenu: contenu || '' },
    });

    if (!created) {
      await page.update({ contenu });
    }

    return res.status(200).json({
      message: 'Page légale mise à jour.',
      page,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  getPageLegale,
  modifierPageLegale,
};
