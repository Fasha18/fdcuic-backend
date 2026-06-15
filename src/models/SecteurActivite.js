const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SecteurActivite = sequelize.define('SecteurActivite', {
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
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'secteurs_activite',
  timestamps: true,
});

module.exports = SecteurActivite;
