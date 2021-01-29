'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.Quiz);
      Review.belongsTo(models.User);
    }
  }
  Review.init(
    {
      puntaje: {  // points no sería mejor ??
        type:  DataTypes.SMALLINT, //O mejor TINYINT?? 
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );
  return Review;
};