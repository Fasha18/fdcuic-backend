const { Evaluation, Projet, User } = require('../models');

// POST /api/evaluations — Évaluer un projet (évaluateur)
const evaluerProjet = async (req, res) => {
  try {
    const { projet_id, note, commentaire, decision } = req.body;
    const evaluateur_id = req.utilisateur.id;

    // Vérifier que la note est entre 0 et 20
    if (note < 0 || note > 20) {
      return res.status(400).json({ message: 'La note doit être comprise entre 0 et 20.' });
    }

    // Vérifier que la décision est valide
    if (!['accepte', 'rejete'].includes(decision)) {
      return res.status(400).json({ message: "Décision invalide. Valeurs : 'accepte' ou 'rejete'." });
    }

    // Vérifier que le projet existe
    const projet = await Projet.findByPk(projet_id);
    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // Vérifier que cet évaluateur n'a pas déjà évalué ce projet
    const dejaEvalue = await Evaluation.findOne({ where: { projet_id, evaluateur_id } });
    if (dejaEvalue) {
      return res.status(409).json({ message: 'Vous avez déjà évalué ce projet.' });
    }

    const evaluation = await Evaluation.create({
      note,
      commentaire,
      decision,
      date_evaluation: new Date(),
      projet_id,
      evaluateur_id
    });

    // Mettre à jour le statut du projet en fonction de la décision
    await projet.update({ statut: decision });

    return res.status(201).json({
      message: 'Évaluation enregistrée avec succès.',
      data: evaluation
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/evaluations/:id — Détail d'une évaluation
const detailEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findByPk(id, {
      include: [
        { model: Projet, attributes: ['id', 'titre', 'statut'] },
        { model: User, as: 'evaluateur', attributes: ['id', 'nom', 'prenom'] }
      ]
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation introuvable.' });
    }

    return res.status(200).json({
      message: 'Détail de l\'évaluation.',
      data: evaluation
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/evaluations/:id — Modifier une évaluation (évaluateur)
const modifierEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, commentaire, decision } = req.body;
    const evaluateur_id = req.utilisateur.id;

    const evaluation = await Evaluation.findByPk(id);

    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation introuvable.' });
    }

    // Un évaluateur ne peut modifier que sa propre évaluation
    if (evaluation.evaluateur_id !== evaluateur_id) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres évaluations.' });
    }

    if (note !== undefined && (note < 0 || note > 20)) {
      return res.status(400).json({ message: 'La note doit être entre 0 et 20.' });
    }

    if (decision && !['accepte', 'rejete'].includes(decision)) {
      return res.status(400).json({ message: "Décision invalide." });
    }

    await evaluation.update({
      ...(note !== undefined && { note }),
      ...(commentaire && { commentaire }),
      ...(decision && { decision })
    });

    // Mettre à jour le statut du projet si la décision change
    if (decision) {
      const projet = await Projet.findByPk(evaluation.projet_id);
      if (projet) await projet.update({ statut: decision });
    }

    return res.status(200).json({
      message: 'Évaluation mise à jour.',
      data: evaluation
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { evaluerProjet, detailEvaluation, modifierEvaluation };