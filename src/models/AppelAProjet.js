const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppelAProjet = sequelize.define('AppelAProjet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Type de projet concerné par cet appel
  type_projet: {
    type: DataTypes.ENUM('structuration', 'formation', 'evenementiel'),
    allowNull: true,
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('ouvert', 'fermé'),
    defaultValue: 'ouvert',
  },
  criteres: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  budget_total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Usage interne uniquement — non affiché aux candidats',
  },
  image_couverture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Chemin vers l image de couverture de l appel',
  },
}, {
  tableName: 'appel_a_projet',
  timestamps: true,
});

module.exports = AppelAProjet;