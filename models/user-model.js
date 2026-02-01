const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255],
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: (user) => {
        if (user.name) user.name = user.name.trim();
        if (user.email) user.email = user.email.trim();
      },
      beforeUpdate: (user) => {
        if (user.name) user.name = user.name.trim();
        if (user.email) user.email = user.email.trim();
      },
    },
  },
);

module.exports = User;
