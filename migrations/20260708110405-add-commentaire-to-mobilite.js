'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('projets_mobilite', 'commentaire', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Commentaire de l\'évaluateur en cas de rejet',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('projets_mobilite', 'commentaire');
  }
};
