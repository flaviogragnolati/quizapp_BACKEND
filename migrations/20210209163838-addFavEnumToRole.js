'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'Roles',
      columnName: 'name',
      defaultValue: 'Student',
      newValues: ['Student', 'Teacher', 'Enrolled', 'Fan'],
      enumName: 'enum_Roles_name',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'Roles',
      columnName: 'name',
      defaultValue: 'Student',
      newValues: ['Student', 'Teacher', 'Enrolled'],
      enumName: 'enum_Roles_name',
    });
  },
};
