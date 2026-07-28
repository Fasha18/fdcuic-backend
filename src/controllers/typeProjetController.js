const { TypeProjet, AppelProjet, sequelize } = require('../models/index');

// GET admin — tous les types + stats
const listerTypes = async (req, res) => {
  try {
    const types = await TypeProjet.findAll({ order: [['code', 'ASC']] });

    const typesAvecStats = await Promise.all(
      types.map(async (type) => {
        let stats = { total: 0, soumis: 0, en_examen: 0, accepte: 0, rejete: 0, taux_acceptation: 0 };
        try {
          const total = await AppelProjet.count({ where: { type_projet: type.code } });
          const soumis = await AppelProjet.count({ where: { type_projet: type.code, statut: 'soumis' } });
          const en_examen = await AppelProjet.count({ where: { type_projet: type.code, statut: 'en_examen' } });
          const accepte = await AppelProjet.count({ where: { type_projet: type.code, statut: 'accepte' } });
          const rejete = await AppelProjet.count({ where: { type_projet: type.code, statut: 'rejete' } });
          const taux_acceptation = total > 0 ? Math.round((accepte / total) * 100) : 0;
          stats = { total, soumis, en_examen, accepte, rejete, taux_acceptation };
        } catch (e) {
          // If stats query fails (e.g., ENUM mismatch), return zeros — don't crash
        }
        return { ...type.toJSON(), stats };
      })
    );

    return res.status(200).json({ types: typesAvecStats });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET public — lister les types actifs uniquement
const listerTypesPublic = async (req, res) => {
  try {
    const types = await TypeProjet.findAll({ 
      where: { actif: true },
      order: [['code', 'ASC']] 
    });
    return res.status(200).json({ types });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST admin — ajouter un type de projet
const creerType = async (req, res) => {
  try {
    const { label, description } = req.body;
    
    if (!label) {
      return res.status(400).json({ message: 'Le titre (label) est obligatoire.' });
    }

    // Générer un code à partir du label (lowercase, pas d'espaces, sans accents)
    let baseCode = label
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    
    // S'assurer de l'unicité
    let code = baseCode;
    let counter = 1;
    while (await TypeProjet.findOne({ where: { code } })) {
      code = `${baseCode}-${counter}`;
      counter++;
    }

    const nouveauType = await TypeProjet.create({
      code,
      label,
      description: description || '',
      actif: true
    });

    return res.status(201).json({ message: 'Type de projet créé avec succès.', type: nouveauType });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT admin — modifier un type de projet (label, description, ou actif pour réactivation)
const modifierType = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, description, actif } = req.body;

    const typeProjet = await TypeProjet.findByPk(id);
    if (!typeProjet) {
      return res.status(404).json({ message: 'Type de projet introuvable.' });
    }

    const updates = {};
    if (label !== undefined) updates.label = label;
    if (description !== undefined) updates.description = description;
    if (actif !== undefined) updates.actif = actif;

    await typeProjet.update(updates);

    return res.status(200).json({ message: 'Type de projet mis à jour.', type: typeProjet });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE admin — désactiver un type de projet (soft delete sécurisé via SQL direct)
// On utilise du SQL brut pour éviter tout problème de sync ORM ou colonne manquante
const supprimerType = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le type existe
    const typeProjet = await TypeProjet.findByPk(id);
    if (!typeProjet) {
      return res.status(404).json({ message: 'Type de projet introuvable.' });
    }

    // Étape 1 : S'assurer que la colonne actif existe (idempotent)
    try {
      await sequelize.query(
        `ALTER TABLE types_projet ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true`
      );
    } catch (colErr) {
      // Colonne déjà existante ou erreur non bloquante — on continue
    }

    // Étape 2 : Désactiver via SQL direct (bypass ORM)
    await sequelize.query(
      `UPDATE types_projet SET actif = false, "updatedAt" = NOW() WHERE id = :id`,
      { replacements: { id: typeProjet.id }, type: sequelize.QueryTypes.UPDATE }
    );

    return res.status(200).json({ message: 'Type de projet désactivé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerTypes,
  listerTypesPublic,
  creerType,
  modifierType,
  supprimerType,
};
