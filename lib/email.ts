import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required for email delivery.");
  }

  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.EMAIL_FROM ?? "Proxy <onboarding@resend.dev>";
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getResend();

  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: "Reset your Proxy password",
    html: `<p>You requested a password reset.</p><p><a href=\"${resetUrl}\">Reset Password</a></p><p>If you did not request this, ignore this email.</p>`
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const resend = getResend();

  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: "Verify your Proxy email",
    html: `<p>Please verify your email address.</p><p><a href=\"${verifyUrl}\">Verify Email</a></p>`
  });
}
