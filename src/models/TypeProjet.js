const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TypeProjet = sequelize.define('TypeProjet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nb_etapes: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'types_projet',
  timestamps: true,
});

module.exports = TypeProjet;
