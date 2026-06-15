const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  note: { type: DataTypes.FLOAT, allowNull: false},

  commentaire: { type: DataTypes.TEXT, allowNull: false},

  date_evaluation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  decision: {
    type: DataTypes.ENUM('accepte', 'rejete', 'en_attente'),
    allowNull: false,
  },
}, {
  tableName: 'evaluation',
  timestamps: true, 
});

module.exports = Evaluation;