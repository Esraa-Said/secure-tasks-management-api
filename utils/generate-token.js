const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const EmailType = require("./email-types");

const generateActivationCode = async (user, type) => {
  const code = crypto.randomBytes(32).toString("hex");
  const hashedCode = await bcrypt.hash(code, 10);

  switch (type) {
    case EmailType.VERIFICATION:
      user.verificationToken = hashedCode;
      user.verificationExpiry = new Date(
        Date.now() + 1000 * 60 * process.env.EXPIRATION_IN_MINUTES,
      );
      break;
    case EmailType.RESET_PASSWORD:
      user.resetPasswordToken = hashedCode;
      user.resetPasswordExpiry = new Date(
        Date.now() + 1000 * 60 * process.env.EXPIRATION_IN_MINUTES,
      );
      break;
  }

  await user.save();

  return code;
};

module.exports = generateActivationCode;
