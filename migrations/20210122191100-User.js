'use strict';
const { DataTypes } = require('sequelize');


module.exports = {

   up: async (queryInterface) => {

    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Users', 'resetPasswordToken', {
          type: DataTypes.STRING,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.addColumn('Users', 'resetPasswordExpires', {
          type: DataTypes.INTEGER,
          allowNull: true,
        }, { transaction: t })
      ]);
    });
  
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('User', 'resetPasswordToken', { transaction: t }),
        queryInterface.removeColumn('User', 'resetPasswordExpires', { transaction: t })
      ]);
    });
  }
    
};
