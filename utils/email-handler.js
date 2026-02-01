const nodemailer = require("nodemailer");
const generateCode = require("./generate-code");
const getVerificationMail = require("./verification-mail");
const getResetPasswordMail = require("./reset-password-mail");
const EmailType = require("./email-types");
const CustomError = require("./custom-error");
const getWelcomeMail = require("./welcome-mail");

const emailFunctions = {
  [EmailType.VERIFICATION]: (user, code) => getVerificationMail(user, code),
  [EmailType.RESET_PASSWORD]: (user, code) => getResetPasswordMail(user, code),
  [EmailType.WELCOME]: (user) => getWelcomeMail(user),
};
const handleEmail = async (user, type) => {
  if (!emailFunctions[type]) {
    throw new CustomError("Invalid email type", 404);
  }
  let code = null;
  if (type === EmailType.VERIFICATION || type === EmailType.RESET_PASSWORD) {
    code = await generateCode(user, type);
  }

  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SITE_EMAIL,
      pass: process.env.SITE_EMAIL_PASSWORD,
    },
  });

  let mail = emailFunctions[type](user, code);

  await transporter.sendMail(mail);
};

module.exports = handleEmail;
