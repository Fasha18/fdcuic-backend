const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM('email', 'push', 'in_app'),
      defaultValue: 'in_app',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Peut être null pour les notifications globales (à tous)
    },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
    date_envoi: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    
}, {
    tableName: 'notification',
    timestamps: true,
});

module.exports = Notification;