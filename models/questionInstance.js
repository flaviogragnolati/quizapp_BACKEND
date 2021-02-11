'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuestionInstance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      QuestionInstance.belongsTo(models.Answer);
      QuestionInstance.belongsTo(models.Question);
      QuestionInstance.belongsTo(models.QuizAttempt);
    }
  }
  QuestionInstance.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'QuestionInstance',
    }
  );
  return QuestionInstance;
};
