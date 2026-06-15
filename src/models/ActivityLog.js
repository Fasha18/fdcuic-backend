const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  cible_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ex: AppelProjet, ProjetMobilite, User',
  },
  cible_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'activity_logs',
  timestamps: true,
});

module.exports = ActivityLog;
