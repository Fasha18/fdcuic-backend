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

// DELETE admin — supprimer un type de projet (soft delete ou hard delete si non utilisé)
const supprimerType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const typeProjet = await TypeProjet.findByPk(id);
    if (!typeProjet) {
      return res.status(404).json({ message: 'Type de projet introuvable.' });
    }

    // Vérifier si des dossiers l'utilisent
    const totalAppels = await AppelProjet.count({ where: { type_projet: typeProjet.code } });
    
    if (totalAppels > 0) {
      // Soft delete: on le rend inactif (pour l'instant la DB n'a peut-être pas prévu de filter par actif, mais c'est l'idée)
      await typeProjet.update({ actif: false });
      return res.status(200).json({ message: 'Type de projet désactivé car des dossiers y sont rattachés.' });
    } else {
      await typeProjet.destroy();
      return res.status(200).json({ message: 'Type de projet supprimé avec succès.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerTypes,
  creerType,
  modifierType,
  supprimerType,
};
