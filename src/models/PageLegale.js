const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PageLegale = sequelize.define('PageLegale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('mentions_legales', 'cgu', 'confidentialite'),
    allowNull: false,
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'pages_legales',
  timestamps: true,
});

module.exports = PageLegale;
