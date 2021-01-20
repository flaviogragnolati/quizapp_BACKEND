'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuizTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  QuizTag.init(
    {
      name: {
        type:  DataTypes.STRING, 
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'QuizTag',
    }
  );
  return QuizTag;
};