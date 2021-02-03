'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
       return queryInterface.addColumn(
        'Schools',
        'password',
        {
          type: Sequelize.STRING,
          //defaultValue: "1234",
          allowNull: false,
          set(value) {
            if (value) {
              const salt = bcrypt.genSaltSync(10);
              const hash = bcrypt.hashSync(value, salt);
              this.setDataValue('password', hash);
            }
          },
        },
      );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Schools',
      'password',
    );
  }
};
