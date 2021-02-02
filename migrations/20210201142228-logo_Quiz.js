'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Quizzes',
      'logo',
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
      'Quizzes',
      'logo',
    );
  }
};
