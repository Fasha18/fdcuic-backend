const { TypeProjet, AppelProjet } = require('../models/index');

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

// PUT admin — modifier un type de projet
const modifierType = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, description } = req.body;

    const typeProjet = await TypeProjet.findByPk(id);
    if (!typeProjet) {
      return res.status(404).json({ message: 'Type de projet introuvable.' });
    }

    await typeProjet.update({ label, description });

    return res.status(200).json({ message: 'Type de projet mis à jour.', type: typeProjet });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE admin — désactiver un type de projet (soft delete sécurisé)
// On ne supprime jamais physiquement pour éviter les erreurs de contrainte FK
// (DocumentModele et DocumentTemplate sont liés à TypeProjet)
const supprimerType = async (req, res) => {
  try {
    const { id } = req.params;

    const typeProjet = await TypeProjet.findByPk(id);
    if (!typeProjet) {
      return res.status(404).json({ message: 'Type de projet introuvable.' });
    }

    // Soft delete systématique : on désactive le type sans le supprimer de la BD
    // Cela évite les erreurs de contrainte FK avec DocumentModele et DocumentTemplate
    await typeProjet.update({ actif: false });

    // Message selon qu'il y a ou non des dossiers liés
    let totalAppels = 0;
    try {
      totalAppels = await AppelProjet.count({ where: { type_projet: typeProjet.code } });
    } catch (e) {
      // Si le count échoue (ex: problème ENUM), on continue quand même
    }

    const message = totalAppels > 0
      ? 'Type de projet désactivé. Les dossiers existants sont conservés.'
      : 'Type de projet désactivé avec succès.';

    return res.status(200).json({ message });
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
