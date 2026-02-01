const path = require("path");

const getWelcomeMail = (user) => {
  const mail = {
    from: `${process.env.SITE_NAME} <${process.env.SITE_EMAIL}>`,
    to: user.email,
    subject: `Welcome to ${process.env.SITE_NAME}!`,
    text: `Hello ${user.name}, welcome to ${process.env.SITE_NAME}! We're glad to have you onboard.`,
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
          <img src="cid:logo" alt="${process.env.SITE_NAME} Logo" width="250" style="margin-bottom:20px;" />
        </div>
        <h2 style="color:#333;">Hello ${user.name},</h2>
        <p style="color:#555;">Welcome to <strong>${process.env.SITE_NAME}</strong>! We're thrilled to have you as part of our community.</p>
        <p style="color:#555;">You can now log in and explore all the features available to you.</p>
        <div style="text-align:center; margin:20px 0;">
          <a href="${process.env.CLIENT_URL}/login" 
             style="background-color:#28a745; color:white; padding:12px 25px; border-radius:6px; text-decoration:none; font-weight:bold;">
             Go to Dashboard
          </a>
        </div>
        <p style="font-size:12px; color:#888; border-top:1px solid #eee; padding-top:10px;">
          If you have any questions, feel free to contact our support team.<br>
          &copy; ${new Date().getFullYear()} ${process.env.SITE_NAME}. All rights reserved.
        </p>
      </div>
    `,
  };

  return mail;
};

module.exports = getWelcomeMail;
