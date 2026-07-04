'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'est_desactive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('user', 'est_supprime', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('user', 'derniere_connexion', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('user', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('user', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'est_desactive');
    await queryInterface.removeColumn('user', 'est_supprime');
    await queryInterface.removeColumn('user', 'derniere_connexion');
    await queryInterface.removeColumn('user', 'createdAt');
    await queryInterface.removeColumn('user', 'updatedAt');
  }
};
