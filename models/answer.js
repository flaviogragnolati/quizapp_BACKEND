'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Answer.belongsTo(Question);
      // Answer.hasMany(QuizInstance) ;
    }
  }
  Answer.init(
    {
      text: { // La idea es generar un array de objetos. Propiedad: true or false. Value: opción del multiple choice
        type:  DataTypes.ARRAY(DataTypes.HSTORE), //Revisar por las dudas xD
        allowNull: false,
      },
     },
    {
      sequelize,
      modelName: 'Answer',
    }
  );
  return Answer;
};