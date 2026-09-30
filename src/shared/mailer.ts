// src/shared/mailer.ts
import nodemailer from 'nodemailer';
import { config } from './config.js';

// Created once at module load; nodemailer reuses the connection pool.
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  // Use STARTTLS on port 587 / plaintext on 1025 (Mailpit). Port 465 needs secure: true.
  secure: false,
  auth:
    config.SMTP_USER && config.SMTP_PASS
      ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
      : undefined,
});

// Send a verification OTP. Always pass the raw OTP — never the hash.
export async function sendVerificationEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: 'Verify your email address',
    text: [
      'Welcome to the job portal.',
      '',
      'Your verification code is:',
      '',
      `    ${otp}`,
      '',
      'Enter this code in the app to activate your account.',
      'The code expires in 15 minutes.',
      '',
      'If you did not create an account, you can ignore this email.',
    ].join('\n'),
  });
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    ...options,
  });
}

// src/shared/mailer.ts — add:

export async function sendInterviewNotification(
  to: string,
  jobTitle: string,
  scheduledAt: Date,
  meetingLink: string,
  notes: string | null
) {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: `Interview scheduled — ${jobTitle}`,
    text: [
      `Your interview for ${jobTitle} has been scheduled.`,
      `Date/Time: ${scheduledAt.toUTCString()}`,
      `Meeting link: ${meetingLink}`,
      notes ? `Notes from the recruiter: ${notes}` : '',
    ].filter(Boolean).join('\n\n'),
  });
}

// Send confirmation email after a successful application submission

let failOnce = true;


export async function sendApplicationConfirmationEmail(
  to: string,
  jobTitle: string,
  companyName: string
): Promise<void> {

  // DEMO ONLY: fail the first attempt to demonstrate BullMQ retry
  if (failOnce) {
    failOnce = false;
    throw new Error('SMTP timeout (simulated)');
  }


  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: `Application received: ${jobTitle} at ${companyName}`,
    text: [
      `Thank you for applying to ${jobTitle} at ${companyName}.`,
      `Your application has been received and is under review.`,
      `You will hear back from the hiring team if your profile is a match.`,
    ].join('\n\n'),
  });
}

// Weekly digest email for company owners
export async function sendRecruiterDigestEmail(
  to: string,
  companyName: string,
  openJobsCount: number,
  applicationsLast7Days: number,
  interviewsThisWeek: number
): Promise<void> {
  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: `Weekly digest for ${companyName}`,
    text: [
      `Weekly hiring summary for ${companyName}`,
      '',
      `Open jobs:                  ${openJobsCount}`,
      `Applications (last 7 days): ${applicationsLast7Days}`,
      `Interviews this week:       ${interviewsThisWeek}`,
    ].join('\n'),
  });
}