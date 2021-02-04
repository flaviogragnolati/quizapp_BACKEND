'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("SchoolCodes", "deletedAt", {
      type: Sequelize.DATE,
      
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'SchoolCodes',
      'deletedAt',
    );
  }
};
