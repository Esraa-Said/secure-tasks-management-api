const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcryptjs");

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
      allowNull: { msg: "Name must have a value" },
      validate: {
        notEmpty: { msg: "Name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "Name must be between 2 and 100 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: { msg: "Email must have a value" },
      unique: { msg: "User already exists" },
      validate: {
        notEmpty: { msg: "Email cannot be empty" },
        isEmail: { msg: "Must be a valid email address" },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: { msg: "Password must have a value" },
      validate: {
        notEmpty: { msg: "Password cannot be empty" },
        len: { args: [6, 255], msg: "Password must be at least 6 characters" },
        isStrong(value) {
          const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
          if (!strongRegex.test(value)) {
            throw new CustomError(
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              400,
            );
          }
        },
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpiry: {
      type: DataTypes.DATE,
      allowNull: true, 
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: beforeSave,
      beforeUpdate: beforeSave,
    },
  },
);

const beforeSave = async (user) => {
  if (user.name) user.name = user.name.trim();
  if (user.email) user.email = user.email.trim();
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
};

module.exports = User;
