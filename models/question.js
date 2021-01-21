'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.hasMany(models.Answer); //Porque también tiene las incorrectas
      Question.hasMany(models.QuestionInstance);
      Question.belongsTo(models.Quiz);
     }
  }
  Question.init(
    {
      title: {
        type:  DataTypes.STRING,
        allowNull: false,
      },
      modifiedBy: {
        type: DataTypes.INTEGER, // id del user que lo modificó
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER, // id del user que lo creó
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Question',
    }
  );
  return Question;
};