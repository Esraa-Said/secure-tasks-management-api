const { where } = require("sequelize");
const User = require("../models/user-model");
const asyncWrapper = require("../utils/async-wrapper");
const CustomError = require("../utils/custom-error");
const handleEmail = require("../utils/email-handler");
const EmailType = require("../utils/email-types");
const httpStatusText = require("../utils/http-status-text");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  // in database schema [msg appear if email exists]
  // in database schema [msg appear if password not secure]
  // hash password before save in user-modal
  const user = await User.create(req.body);

  await handleEmail(user, EmailType.VERIFICATION);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Mail is sent to your email, Please verify your account",
  });
});

const verifyAccount = asyncWrapper(async (req, res, next) => {
  const code = req.params.code;

  let decoded;
  try {
    decoded = jsonwebtoken.verify(code, process.env.JWT_SECRET);
  } catch (err) {
    return next(new CustomError("Invalid or expired verification link", 400));
  }

  const { userId } = decoded;

  const user = await User.findByPk(userId);
  if (!user) return next(new CustomError("User not found", 404));
  if (user.isVerified)
    return next(new CustomError("User already verified", 400));

  user.isVerified = true;
  await user.save();
  handleEmail(user, EmailType.WELCOME);

  const authToken = jsonwebtoken.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.USER_AUTH_TOKEN_EXPIRATION_IN },
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "User verified successfully",
    data: { user: { email: user.email, name: user.name } },
    token: authToken,
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new CustomError("Email and password are required", 400));
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new CustomError("User not found", 404));
  }
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    return next(new CustomError("User not found", 404));
  }
  if (!user.isVerified) {
    return next(
      new CustomError("Please verify your email before logging in", 403),
    );
  }

  const authToken = jsonwebtoken.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.USER_AUTH_TOKEN_EXPIRATION_IN },
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { user: { email: user.email, name: user.name } },
    token: authToken,
  });
});

module.exports = { register, verifyAccount, login };
