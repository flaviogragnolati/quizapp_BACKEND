'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'photo',
      {
       type: Sequelize.TEXT,
       validate: {
         isURL: true,
       },
       allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Users',
      'photo',
    );
  }
};
