const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  reponse: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'faqs',
  timestamps: true,
});

module.exports = FAQ;
