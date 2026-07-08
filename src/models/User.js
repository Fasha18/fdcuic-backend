const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
    },
    mot_de_passe_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('candidat', 'evaluateur', 'admin'),
        allowNull: false,
        defaultValue: 'candidat',
    },
    est_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Compte activé via email ou non',
    },
    token_activation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Token unique envoyé par email pour activation',
    },
    est_desactive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Désactivé manuellement par admin (soft ban)',
    },
    est_supprime: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Soft delete pour conserver l\'intégrité des dossiers',
    },
    derniere_connexion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // ── RESET MOT DE PASSE ──────────────────────────────────
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Token de réinitialisation de mot de passe',
    },
    reset_token_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date d'expiration du token de réinitialisation (1 heure)",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'user',
    timestamps: true,
  }
);

module.exports = User;
