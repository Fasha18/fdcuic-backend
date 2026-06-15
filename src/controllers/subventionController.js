const { Subvention, Projet, User, sequelize } = require('../models');

// POST /api/subventions — Attribuer une subvention (admin)
const attribuerSubvention = async (req, res) => {
  try {
    const { projet_id, montant, reference_virement } = req.body;

    // Vérifier que le projet existe
    const projet = await Projet.findByPk(projet_id);
    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // Seul un projet accepté ou approuvé peut recevoir une subvention
    if (projet.statut !== 'accepte' && projet.statut !== 'approuve') {
      return res.status(400).json({ 
        message: 'Seul un projet accepté ou approuvé peut recevoir une subvention.' 
      });
    }

    // Vérifier qu'une subvention n'existe pas déjà pour ce projet
    const dejaAttribuee = await Subvention.findOne({ where: { projet_id } });
    if (dejaAttribuee) {
      return res.status(409).json({ 
        message: 'Une subvention a déjà été attribuée à ce projet.' 
      });
    }

    const subvention = await Subvention.create({
      montant,
      reference_virement,
      date_attribution: new Date(),
      statut_paiement: 'en_attente',
      projet_id
    });

    return res.status(201).json({
      message: 'Subvention attribuée avec succès.',
      data: subvention
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/subventions/:id — Mettre à jour le statut paiement (admin)
const mettreAJourStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut_paiement, reference_virement } = req.body;

    const statutsValides = ['en_attente', 'verse', 'annule'];
    if (!statutsValides.includes(statut_paiement)) {
      return res.status(400).json({ 
        message: `Statut invalide. Valeurs acceptées : ${statutsValides.join(', ')}` 
      });
    }

    const subvention = await Subvention.findByPk(id, {
      include: [{ model: Projet, attributes: ['id', 'titre', 'user_id'] }]
    });

    if (!subvention) {
      return res.status(404).json({ message: 'Subvention introuvable.' });
    }

    await subvention.update({
      statut_paiement,
      ...(reference_virement && { reference_virement })
    });

    return res.status(200).json({
      message: `Statut de paiement mis à jour : ${statut_paiement}.`,
      data: subvention
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/subventions/:id — Détail d'une subvention
const detailSubvention = async (req, res) => {
  try {
    const { id } = req.params;

    const subvention = await Subvention.findByPk(id, {
      include: [{
        model: Projet,
        attributes: ['id', 'titre', 'statut'],
        include: [{ model: User, attributes: ['id', 'nom', 'prenom', 'email'] }]
      }]
    });

    if (!subvention) {
      return res.status(404).json({ message: 'Subvention introuvable.' });
    }

    return res.status(200).json({
      message: 'Détail de la subvention.',
      data: subvention
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/subventions — Liste de toutes les subventions avec stats
const getAllSubventions = async (req, res) => {
  try {
    const subventions = await Subvention.findAll({
      include: [{
        model: Projet,
        as: 'projet',
        attributes: ['id', 'titre', 'statut', 'type_projet'],
        include: [{ model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    const total = subventions.length;
    const montant_total = subventions.reduce((sum, s) => sum + Number(s.montant), 0);
    const montant_verse = subventions.filter(s => s.statut_paiement === 'verse').reduce((sum, s) => sum + Number(s.montant), 0);
    const montant_en_attente = subventions.filter(s => s.statut_paiement === 'en_attente').reduce((sum, s) => sum + Number(s.montant), 0);
    
    // Projets acceptés sans subvention
    const projetsAcceptesSansSubvention = await Projet.count({
      where: { statut: 'accepte' },
      include: [{
        model: Subvention,
        as: 'subvention',
        required: false
      }],
      having: sequelize.where(sequelize.col('subvention.id'), 'IS', null)
    });

    return res.status(200).json({
      message: 'Liste des subventions récupérée avec succès.',
      data: {
        subventions,
        stats: {
          total,
          montant_total,
          montant_verse,
          montant_en_attente,
          projets_attente_subvention: projetsAcceptesSansSubvention
        }
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { attribuerSubvention, mettreAJourStatut, detailSubvention, getAllSubventions };