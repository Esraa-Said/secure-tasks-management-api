const path = require("path");

const getResetPasswordMail = (user, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const mail = {
    from: `${process.env.siteName} <${process.env.SITE_EMAIL}>`,
    to: user.email,
    subject: `Reset your ${process.env.siteName} password`,
    text: `Hello ${user.name}, you requested a password reset. Click this link to reset your password: ${resetLink}`,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../assets/logo.jpg"),
        cid: "logo",
      },
    ],
    html: `
      <div style="font-family:Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">
        <div style="text-align:center;">
          <img src="cid:logo" alt="${process.env.siteName} Logo" width="250" style="margin-bottom:20px;" />
        </div>
        <h2 style="color:#333;">Hello ${user.name},</h2>
        <p style="color:#555;">We received a request to reset your password for your <strong>${process.env.siteName}</strong> account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align:center; margin:20px 0;">
          <a href="${resetLink}" 
             style="background-color:#ff7511; color:white; padding:12px 25px; border-radius:6px; text-decoration:none; font-weight:bold;">
             Reset My Password
          </a>
        </div>
        <p style="color:#555;">This link will expire in ${process.env.EXPIRATION_IN_MINUTES} minutes.</p>
        <p style="font-size:12px; color:#888; border-top:1px solid #eee; padding-top:10px;">
          If you didn’t request a password reset, please ignore this email.<br>
          &copy; ${new Date().getFullYear()} ${process.env.siteName}. All rights reserved.
        </p>
      </div>
    `,
  };

  return mail;
};

module.exports = getResetPasswordMail;
