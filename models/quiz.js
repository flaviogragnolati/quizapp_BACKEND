'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Quiz.hasMany(models.QuizAttempt);
      Quiz.hasMany(models.Question);
      Quiz.belongsToMany(models.QuizTag, {through: 'Quiz-QTag'});
      Quiz.belongsTo(models.Subject);
      Quiz.belongsTo(models.School);
      Quiz.hasMany(models.Review);
      Quiz.belongsToMany(models.User, {through: models.Role});


     }
  }
  Quiz.init(
    {
      quantity: {
        type: DataTypes.INTEGER, // se hace un contador automático?
        // allowNull: false,
      },
      name: {
          type: DataTypes.STRING,
          allowNull: false,
         },
     description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
      modifiedBy: {
        type: DataTypes.INTEGER, // id del user que lo modificó
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER, // id del user que lo creó
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Quiz',
    }
  );
  return Quiz;
};
