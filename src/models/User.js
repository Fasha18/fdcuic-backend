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

 },
 {
    tableName: 'user',
    timestamps: false,
    
    
  }
);module.exports = User;
