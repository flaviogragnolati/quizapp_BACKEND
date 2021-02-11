'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuizAttempt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      QuizAttempt.hasOne(models.QuestionInstance);
      QuizAttempt.belongsTo(models.Quiz);
      QuizAttempt.belongsTo(models.User);
    }
  }
  QuizAttempt.init(
    {
      finished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      grade: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'QuizAttempt',
    }
  );
  return QuizAttempt;
};
