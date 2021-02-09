'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("QuizAttempts", "UserId", {
      type: Sequelize.INTEGER,
//      references: {
//        model: "Users",
//        key: "id",
//      },
//      onUpdate: 'CASCADE',
//      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("QuizAttempts", "UserId");
  }
};
