const nodemailer = require('nodemailer');

// Creates a transporter if SMTP is configured; otherwise returns null
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendMail({ to, subject, html, from }) {
  const transporter = createTransporter();
  if (!transporter) {
    // Fallback: log to console in development
    console.log('[EMAIL:FALLBACK] To:', to);
    console.log('[EMAIL:FALLBACK] Subject:', subject);
    console.log('[EMAIL:FALLBACK] HTML:', html);
    return { accepted: [to], messageId: 'fallback' };
  }
  const info = await transporter.sendMail({ from: from || process.env.MAIL_FROM || 'no-reply@navboat.com', to, subject, html });
  return info;
}

module.exports = { sendMail };
