const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgrammeMobilite = sequelize.define('ProgrammeMobilite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Programme de Mobilité Internationale',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'Description du programme de mobilité...',
  },
  criteres_eligibilite: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_couverture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Chemin vers l\'image de couverture du programme de mobilité',
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif'),
    defaultValue: 'actif',
  },
}, {
  tableName: 'programme_mobilite',
  timestamps: true,
});

module.exports = ProgrammeMobilite;
