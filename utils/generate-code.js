const jsonwebtoken = require("jsonwebtoken");
const EmailType = require("./email-types");

const generateCode = async (user, type) => {
  const code = jsonwebtoken.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.EXPIRATION_IN_MINUTES}m`,
  });

  return code;
};

module.exports = generateCode;
