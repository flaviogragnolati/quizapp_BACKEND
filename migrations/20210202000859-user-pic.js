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
       defaultValue: "https://lh5.googleusercontent.com/-NVHdsx0r0Xk/TYyS1Qen3JI/AAAAAAAAAGU/AMvdDulXehs/s1600/zarpas.png",
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
