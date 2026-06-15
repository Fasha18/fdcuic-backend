const { FAQ } = require('../models/index');

// GET public — FAQs actives triées par ordre
const listerFaqsPublic = async (req, res) => {
  try {
    const faqs = await FAQ.findAll({
      where: { actif: true },
      order: [['ordre', 'ASC']],
    });
    return res.status(200).json({ faqs });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET admin — toutes les FAQs
const listerFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll({ order: [['ordre', 'ASC']] });
    return res.status(200).json({ faqs });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST admin — créer une FAQ
const creerFaq = async (req, res) => {
  try {
    const { question, reponse, ordre } = req.body;

    if (!question || !reponse) {
      return res.status(400).json({ message: 'La question et la réponse sont obligatoires.' });
    }

    const faq = await FAQ.create({ question, reponse, ordre });
    return res.status(201).json({ message: 'FAQ créée avec succès.', faq });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT admin — modifier une FAQ
const modifierFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ introuvable.' });
    }

    const { question, reponse, ordre, actif } = req.body;
    await faq.update({ question, reponse, ordre, actif });
    return res.status(200).json({ message: 'FAQ mise à jour.', faq });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE admin — supprimer une FAQ
const supprimerFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ introuvable.' });
    }

    await faq.destroy();
    return res.status(200).json({ message: 'FAQ supprimée avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerFaqsPublic,
  listerFaqs,
  creerFaq,
  modifierFaq,
  supprimerFaq,
};
