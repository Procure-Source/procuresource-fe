import nodemailer from "nodemailer";
import crypto from "crypto";
import { getVerifyEmailTemplate } from "./email-templates/verify-email";
import { getResetPasswordTemplate } from "./email-templates/reset-password";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function tokenExpiry(hours = 24): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  const html = getVerifyEmailTemplate(name, verifyUrl);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "ProcureSource <hello@procuresource.co>",
    to,
    subject: "Verify Your Email — ProcureSource",
    html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const html = getResetPasswordTemplate(name, resetUrl);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "ProcureSource <hello@procuresource.co>",
    to,
    subject: "Reset Your Password — ProcureSource",
    html,
  });
}
