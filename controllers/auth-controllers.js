const { where } = require("sequelize");
const User = require("../models/user-model");
const asyncWrapper = require("../utils/async-wrapper");
const CustomError = require("../utils/custom-error");
const handleEmail = require("../utils/email-handler");
const EmailType = require("../utils/email-types");
const httpStatusText = require("../utils/http-status-text");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const createActivityLog = require("../utils/create-activity-log");

const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  // in database schema [msg appear if email exists]
  // in database schema [msg appear if password not secure]
  // hash password before save in user-modal
  const user = await User.create({ name, email, password });

  await handleEmail(user, EmailType.VERIFICATION);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Verification email sent. Please verify your account.",
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
      new CustomError("Please verify your account before logging in", 403),
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
    message: "User login successfully",
    token: authToken,
  });
});

const resendVerification = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(
      new CustomError("User not found, Create an account first", 404),
    );
  }
  if (user.isVerified) {
    return next(new CustomError("Account already verified", 400));
  }

  await handleEmail(user, EmailType.VERIFICATION);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Verification email sent again",
  });
});

const forgetPasswordEmail = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  // protect
  if (!user) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "A reset password link has been sent to your email",
    });
  }

  await handleEmail(user, EmailType.RESET_PASSWORD);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "A reset password link has been sent to your email",
  });
});

const sendResetPasswordEmail = asyncWrapper(async (req, res, next) => {
  await handleEmail(req.user, EmailType.RESET_PASSWORD);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "A reset password link has been sent to your email",
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const token = req.params.code;

  let decodedToken;
  try {
    decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new CustomError("Reset password link expired", 401));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new CustomError("Invalid token", 401));
    }
    return next(err);
  }

  const { password } = req.body;

  const user = await User.findByPk(decodedToken.userId);
  if (!user) {
    return next(new CustomError("User not found", 404));
  }

  user.password = password;
  await user.save();
  await handleEmail(user, EmailType.PASSWORD_CHANGED);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Password has been reset successfully",
  });
});

module.exports = {
  register,
  verifyAccount,
  login,
  resendVerification,
  forgetPasswordEmail,
  sendResetPasswordEmail,
  resetPassword,
};
