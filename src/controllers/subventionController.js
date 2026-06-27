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

// GET /api/subventions — Liste paginée avec filtres et stats
const getAllSubventions = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const page       = Math.max(1,   parseInt(req.query.page)  || 1);
    const limit      = Math.min(100, parseInt(req.query.limit) || 20);
    const offset     = (page - 1) * limit;
    const statut     = req.query.statut;     // en_attente | verse | annule
    const dateDebut  = req.query.date_debut;
    const dateFin    = req.query.date_fin;

    // Filtres
    const where = {};
    if (statut && ['en_attente', 'verse', 'annule'].includes(statut)) {
      where.statut_paiement = statut;
    }
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt[Op.gte] = new Date(dateDebut);
      if (dateFin)   where.createdAt[Op.lte] = new Date(dateFin);
    }

    // Requête paginée
    const { count, rows: subventions } = await Subvention.findAndCountAll({
      where,
      include: [{
        model: Projet,
        as: 'projet',
        attributes: ['id', 'titre', 'statut', 'type_projet'],
        include: [{ model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] }]
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Stats globales (sans filtre pagination)
    const toutesSubventions  = await Subvention.findAll({ attributes: ['montant', 'statut_paiement'] });
    const montant_total      = toutesSubventions.reduce((s, x) => s + Number(x.montant), 0);
    const montant_verse      = toutesSubventions.filter(x => x.statut_paiement === 'verse').reduce((s, x) => s + Number(x.montant), 0);
    const montant_en_attente = toutesSubventions.filter(x => x.statut_paiement === 'en_attente').reduce((s, x) => s + Number(x.montant), 0);

    return res.status(200).json({
      message: 'Liste des subventions récupérée avec succès.',
      data: {
        subventions,
        pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
        stats: { total: toutesSubventions.length, montant_total, montant_verse, montant_en_attente },
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { attribuerSubvention, mettreAJourStatut, detailSubvention, getAllSubventions };