const nodemailer = require('nodemailer');
require('dotenv').config();

async function createTransporter() {
  // If SMTP config provided via env, use it. Otherwise create Ethereal test account.
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback to Ethereal for development/testing
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

async function sendMail({ to, subject, html, text }) {
  const transporter = await createTransporter();
  const fromAddress = process.env.FROM_EMAIL || 'no-reply@osethra.local';

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html
  });

  // If using Ethereal, return preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { info, previewUrl };
}

module.exports = { sendMail };
