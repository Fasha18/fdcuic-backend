const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subvention = sequelize.define('Subvention', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    montant: { type: DataTypes.DECIMAL(15, 2), allowNull: false },

    date_attribution: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

    statut_paiement: { type: DataTypes.ENUM('en_attente', 'verse', 'annule'), defaultValue: 'en_attente' },

    reference_virement: { type: DataTypes.STRING },
}, {
    tableName: 'subvention',
    timestamps: true,
});

module.exports = Subvention;