const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentTemplate = sequelize.define('DocumentTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type_projet_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'FK vers TypeProjet.code',
  },
  nom_document: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Identifiant technique unique ex: business_model, budget_previsionnel',
  },
  label: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Label affiché ex: Business Model Canvas',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description de ce que doit contenir le document',
  },
  fichier_template: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL Cloudinary du fichier template téléchargeable',
  },
  fichier_public_id: {
    type: DataTypes.STRING(300),
    allowNull: true,
    comment: 'Public ID Cloudinary pour permettre la suppression',
  },
  sections: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Structure des sections du document [{ id, titre, description, type, ... }]',
  },
  obligatoire: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si true, le document est obligatoire à la soumission',
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'document_templates',
  timestamps: true,
});

module.exports = DocumentTemplate;
