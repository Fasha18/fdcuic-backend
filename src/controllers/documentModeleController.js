const { DocumentModele, TypeProjet } = require('../models/index');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadDocumentModeles = async (req, res) => {
  try {
    const { id } = req.params; // type_projet_id

    const typeProjet = await TypeProjet.findByPk(id);
    if (!typeProjet) {
      return res.status(404).json({ message: 'Type de projet introuvable' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const modeles = [];

    for (const file of req.files) {
      // Cloudinary multer upload stores path in file.path
      const urlFichier = file.path; 

      const modele = await DocumentModele.create({
        type_projet_id: id,
        nom_document: file.originalname,
        nom_fichier_original: file.originalname,
        chemin_fichier: urlFichier,
        type_mime: file.mimetype,
        taille: file.size || 0,
      });

      modeles.push(modele);
    }

    return res.status(201).json({
      message: `${modeles.length} document(s) uploadé(s) avec succès`,
      modeles
    });
  } catch (error) {
    console.error('Erreur upload document modèles:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getDocumentsModelesParType = async (req, res) => {
  try {
    const { id } = req.params; // peut être un id ou un code
    let typeId = id;

    if (isNaN(id)) {
      const type = await TypeProjet.findOne({ where: { code: id } });
      if (!type) return res.status(404).json({ message: 'Type de projet introuvable' });
      typeId = type.id;
    }

    const modeles = await DocumentModele.findAll({
      where: { type_projet_id: typeId },
      order: [['date_ajout', 'DESC']]
    });

    return res.status(200).json({ documents: modeles });
  } catch (error) {
    console.error('Erreur fetch documents modèles:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const supprimerDocumentModele = async (req, res) => {
  try {
    const { docId } = req.params;

    const modele = await DocumentModele.findByPk(docId);
    if (!modele) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    // Extraction du public_id Cloudinary depuis l'URL
    const chemin = modele.chemin_fichier;
    if (chemin && chemin.includes('cloudinary')) {
      const parts = chemin.split('/');
      const filename = parts.pop();
      const folder = parts.pop();
      const publicId = `${folder}/${filename.split('.')[0]}`;
      
      // Suppression sur Cloudinary avec ressource_type raw pour les fichiers (non-image)
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    await modele.destroy();

    return res.status(200).json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression document modèle:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const telechargerDocumentModele = async (req, res) => {
  try {
    const { docId } = req.params;
    const modele = await DocumentModele.findByPk(docId);
    if (!modele) {
      return res.status(404).json({ message: 'Document introuvable' });
    }
    
    // Pour Cloudinary (resource_type: raw), le lien direct déclenche le téléchargement
    return res.redirect(modele.chemin_fichier);
  } catch (error) {
    console.error('Erreur téléchargement document:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  uploadDocumentModeles,
  getDocumentsModelesParType,
  supprimerDocumentModele,
  telechargerDocumentModele,
};
