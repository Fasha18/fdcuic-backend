const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChampFormulaire = sequelize.define('ChampFormulaire', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type_projet: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Code du type de projet (ex: structuration)',
  },
  nom_champ: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Clé technique (ex: doc_budget)',
  },
  label: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Libellé affiché à l\'utilisateur',
  },
  type_champ: {
    type: DataTypes.ENUM('fichier', 'texte', 'boolean', 'date'),
    defaultValue: 'fichier',
  },
  obligatoire: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'champs_formulaire',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['type_projet', 'nom_champ'] }
  ]
});

module.exports = ChampFormulaire;
