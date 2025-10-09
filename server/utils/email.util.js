/**
 * Email utility for sending emails
 */

const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic send email function
exports.sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html,
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.ORIGIN_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "China Gate - Password Reset Request",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for your China Gate account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">China Gate Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
