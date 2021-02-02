"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Quizzes", "active", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Quizzes',
      'active',
    );
  }
};
