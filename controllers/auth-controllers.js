const User = require("../models/user-model");
const asyncWrapper = require("../utils/async-wrapper");
const handleEmail = require("../utils/email-handler");
const EmailType = require("../utils/email-types");
const httpStatusText = require("../utils/http-status-text");

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

module.exports = { register };
