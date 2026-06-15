const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Projet = sequelize.define('Projet', {
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
    fichier_pdf: {
    type: DataTypes.STRING(500),
  },
    date_soumission: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
    statut: {
        type: DataTypes.ENUM('en_attente', 'approuve', 'rejete', 'accepte'),
        defaultValue: 'en_attente',
    },
}, {
    tableName: 'projet',
    timestamps: false,
});

module.exports = Projet;