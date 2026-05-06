import nodemailer from "nodemailer";

export function createMailer() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export function isMailEnabled(transporter) {
  return !!transporter;
}

export async function sendEmailOrLog({ transporter, to, subject, text, html }) {
  if (!transporter) {
    console.log(`[MAIL DISABLED] To: ${to} | Subject: ${subject}\n${text}`);
    return { delivered: false };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { delivered: true };
  } catch (err) {
    console.error(`[MAIL ERROR] To: ${to} | Subject: ${subject}\n${err.message}`);
    return { delivered: false, error: err.message };
  }
}
