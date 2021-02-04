'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SchoolCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  SchoolCode.init({
    email: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'SchoolCode',
  });
  return SchoolCode;
};