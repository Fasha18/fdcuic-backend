const { DocumentTemplate, TypeProjet } = require('../models/index');
const cloudinary = require('../config/cloudinary');

// ── GET /api/admin/types-projet/:code/documents ─────────────────────────────
const listerParType = async (req, res) => {
  try {
    const type = await TypeProjet.findOne({ where: { code: req.params.code } });
    if (!type) return res.status(404).json({ message: 'Type de projet introuvable.' });

    const documents = await DocumentTemplate.findAll({
      where: { type_projet_code: req.params.code, actif: true },
      order: [['obligatoire', 'DESC'], ['label', 'ASC']],
    });

    return res.json({
      type: { code: type.code, label: type.label, description: type.description },
      documents: documents.map(doc => ({
        id: doc.id,
        nom_document: doc.nom_document,
        label: doc.label,
        description: doc.description,
        sections: doc.sections,
        obligatoire: doc.obligatoire,
        a_fichier: !!doc.fichier_template,
        lien_template: doc.fichier_template || null,
        lien_download: `/api/templates/download/${doc.nom_document}`,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── GET /api/admin/templates ──────────────────────────────────────────────────
const listerTous = async (req, res) => {
  try {
    const templates = await DocumentTemplate.findAll({
      include: [{ model: TypeProjet, as: 'type_projet', attributes: ['code', 'label'] }],
      order: [['type_projet_code', 'ASC'], ['label', 'ASC']],
    });
    return res.json({ templates });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── POST /api/admin/templates ─────────────────────────────────────────────────
const creer = async (req, res) => {
  try {
    const { type_projet_code, nom_document, label, description, sections, obligatoire } = req.body;

    if (!type_projet_code || !nom_document || !label) {
      return res.status(400).json({ message: 'type_projet_code, nom_document et label sont obligatoires.' });
    }

    const type = await TypeProjet.findOne({ where: { code: type_projet_code } });
    if (!type) return res.status(404).json({ message: 'Type de projet introuvable.' });

    const existant = await DocumentTemplate.findOne({ where: { nom_document } });
    if (existant) return res.status(409).json({ message: `Un template avec nom_document "${nom_document}" existe déjà.` });

    const template = await DocumentTemplate.create({
      type_projet_code,
      nom_document,
      label,
      description: description || null,
      sections: sections || [],
      obligatoire: obligatoire !== undefined ? obligatoire : true,
    });

    return res.status(201).json({ message: 'Template créé.', template });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── PUT /api/admin/templates/:id ──────────────────────────────────────────────
const modifier = async (req, res) => {
  try {
    const template = await DocumentTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template introuvable.' });

    const { label, description, sections, obligatoire, actif } = req.body;
    await template.update({
      label: label || template.label,
      description: description !== undefined ? description : template.description,
      sections: sections !== undefined ? sections : template.sections,
      obligatoire: obligatoire !== undefined ? obligatoire : template.obligatoire,
      actif: actif !== undefined ? actif : template.actif,
    });

    return res.json({ message: 'Template modifié.', template });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── DELETE /api/admin/templates/:id ──────────────────────────────────────────
const supprimer = async (req, res) => {
  try {
    const template = await DocumentTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template introuvable.' });

    // Supprimer le fichier Cloudinary si existant
    if (template.fichier_public_id) {
      try {
        await cloudinary.uploader.destroy(template.fichier_public_id, { resource_type: 'raw' });
      } catch (cloudErr) {
        console.warn('Avertissement: impossible de supprimer le fichier Cloudinary:', cloudErr.message);
      }
    }

    await template.destroy();
    return res.json({ message: 'Template supprimé.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── POST /api/admin/templates/:id/fichier ─────────────────────────────────────
// (Le fichier est déjà uploadé par multer-cloudinary, on enregistre l'URL)
const uploadFichierTemplate = async (req, res) => {
  try {
    const template = await DocumentTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template introuvable.' });

    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });

    // Supprimer l'ancien fichier Cloudinary si existant
    if (template.fichier_public_id) {
      try {
        await cloudinary.uploader.destroy(template.fichier_public_id, { resource_type: 'raw' });
      } catch (cloudErr) {
        console.warn('Avertissement: impossible de supprimer l\'ancien fichier:', cloudErr.message);
      }
    }

    // req.file.path = URL Cloudinary, req.file.filename = public_id
    await template.update({
      fichier_template: req.file.path,
      fichier_public_id: req.file.filename,
    });

    return res.json({
      message: 'Fichier template uploadé avec succès.',
      url: req.file.path,
      template,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// ── GET /api/templates/download/:nom_document ─────────────────────────────────
// Route publique — redirige vers l'URL Cloudinary du template
const telecharger = async (req, res) => {
  try {
    const template = await DocumentTemplate.findOne({
      where: { nom_document: req.params.nom_document, actif: true },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template introuvable.' });
    }

    if (!template.fichier_template) {
      return res.status(404).json({
        message: 'Ce template n\'a pas encore de fichier disponible. L\'administrateur doit uploader le fichier.',
      });
    }

    // Rediriger vers l'URL Cloudinary (téléchargement direct)
    return res.redirect(template.fichier_template);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  listerParType,
  listerTous,
  creer,
  modifier,
  supprimer,
  uploadFichierTemplate,
  telecharger,
};
