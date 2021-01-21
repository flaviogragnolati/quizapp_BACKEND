'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class School extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      School.hasMany(models.Quiz);
      School.hasMany(models.Subject);
      School.belongsToMany(models.User, {through: 'School-User'});
     }
  }
  School.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo: {
        type: DataTypes.TEXT,
        validate: {
          isURL: true,
        },
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'School',
    }
  );
  return School;
};
