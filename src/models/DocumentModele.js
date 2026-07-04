const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentModele = sequelize.define('DocumentModele', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type_projet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'types_projet',
      key: 'id'
    }
  },
  nom_document: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nom_fichier_original: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  chemin_fichier: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type_mime: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  taille: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'documents_modeles',
  timestamps: true,
});

module.exports = DocumentModele;
