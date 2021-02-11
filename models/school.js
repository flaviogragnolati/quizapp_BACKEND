'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

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
      School.belongsToMany(models.User, { through: 'School-User' });
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
        },
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
      },
      password: {
        type: DataTypes.STRING,
        //defaultValue: "1234",
        allowNull: false,
        set(value) {
          if (value) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(value, salt);
            this.setDataValue('password', hash);
          }
        },
      },
    },
    {
      sequelize,
      modelName: 'School',
      timestamps: true,
    }
  );
  return School;
};
