const nodemailer = require("nodemailer");
require("dotenv").config();

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Send password reset / setup email
const sendPasswordResetEmail = async (name, email, resetToken, hasPassword = true) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const displayName = name ? name.split(" ")[0] : "User"; // use first name if available

  const mailOptions = {
    from: `"Patient Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: hasPassword ? "Reset Your Password" : "Set Up Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hello ${displayName},</p>
        <p>You requested to ${hasPassword ? 'reset' : 'set up'} your password for your Patient Management System account.</p>
        <p>Please click the button below to continue:</p>
        <p>
          <a href="${resetUrl}"
             style="background-color: #1976d2; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            ${hasPassword ? 'Reset Password' : 'Set Password'}
          </a>
        </p>
        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #555;">${resetUrl}</p>
        <p><strong>Note:</strong> This link will expire in 1 hour.</p>
        ${!hasPassword ? '<p>Setting a password will allow you to log in using either Google or your email and password.</p>' : ''}
        <p style="color: #777; font-size: 12px;">If you didn’t request this, please ignore this email.</p>
      </div>
    `,
    text: `
Hello ${displayName},

You requested to ${hasPassword ? 'reset' : 'set up'} your password for your Patient Management System account.

Click this link to ${hasPassword ? 'reset' : 'set'} your password:
${resetUrl}

This link will expire in 1 hour.

${!hasPassword ? 'Note: Setting a password will allow you to log in using either Google or your email and password.\n\n' : ''}
If you didn’t request this, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };
