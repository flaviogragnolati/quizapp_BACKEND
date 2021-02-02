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
      QuizTag.belongsToMany(models.Quiz, { through: 'Quiz_QTag' });
      // QuizTag.belongsTo(models.Subject);
      //! esto que comentamos aca antes hacia referencia a una columna declarada en .init
      //! en la migracion aparece que se crea la columna, para evitar problemas deberiamos:
      //! borrar la columna con una migracion || borrar la creacion de la columna en la migracion
    }
  }
  QuizTag.init(
    {
      name: {
        type: DataTypes.STRING,
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
