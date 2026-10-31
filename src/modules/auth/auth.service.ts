// src/modules/auth/auth.service.ts
import { createApplicantProfile } from '../applicants/applicants.repo.js';
import { generateOtp, hashOtp } from '../../shared/otp.js';
import { sendVerificationEmail } from '../../shared/mailer.js';
import {
  createEmailVerification,
  findEmailVerification,
  deleteEmailVerificationsForUser,
  activateUser,
} from './auth.repo.js';
import crypto from 'node:crypto';
import { config } from '../../shared/config.js';
import {
  createRefreshToken,
  findRefreshTokenByHash,
  deleteRefreshTokenByHash,
  deleteAllRefreshTokensForUser,
  findUserById,
} from './auth.repo.js';
import { hashPassword, verifyPassword } from '../../shared/password.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors.js';
import { findUserByEmail, createUser } from './auth.repo.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import { signAccessToken } from '../../shared/token.js';
import bcrypt from 'bcrypt';
import { BadRequestError, ForbiddenError } from '../../shared/errors.js';
import {
  findInvitationByToken,
 
  createVerifiedUser,
  createRecruiterRow,
  deleteInvitation,
} from './auth.repo.js';
import { generateTokenPair } from '../../shared/token.js';
import type { AcceptInvitationInput } from './auth.schema.js';


// A pre-computed bcrypt hash of a throwaway string.
// Used in the login path when no user is found, so the timing cost of
// bcrypt.compare is always paid regardless of whether the email exists.
// Generate with: node -e "require('bcryptjs').hash('__dummy__',12).then(console.log)"
const DUMMY_HASH =
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zLklGLsR9XFKQZ5kQlbri';

export async function register(
  input: RegisterInput,
): Promise<{ id: string; email: string; role: string }> {

  const existing = await findUserByEmail(input.email);

  if (existing) {
    throw new ConflictError('Email already taken');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUser(
    input.email,
    passwordHash,
    input.role
  );

  // Automatically create applicant profile
  if (input.role === 'applicant') {
    await createApplicantProfile(
      user.id,
      input.full_name,
      null,
      null,
      []
    );
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  const expiresAt = new Date(
    Date.now() +
    config.OTP_EXPIRES_IN_MINUTES * 60 * 1000
  );

  await createEmailVerification(
    user.id,
    otpHash,
    expiresAt
  );

  await sendVerificationEmail(input.email, otp);

  return user;
}

export async function login(
  input: LoginInput,
): Promise<{ id: string; email: string; role: string; accessToken: string; refreshToken: string }> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    await verifyPassword(input.password, DUMMY_HASH);
    throw new UnauthorizedError('Invalid credentials');
  }

  
  // After (Chapter 23):
  if (user.status === 'pending') {
    throw new UnauthorizedError('Email not verified');
  }
  if (user.status === 'suspended') {
    throw new UnauthorizedError('Account suspended');
  }

  if (user.status !== 'active') {
  throw new UnauthorizedError('Account suspended');
}

  const valid = await verifyPassword(input.password, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user.id, user.role);

  return { id: user.id, email: user.email, role: user.role, accessToken, refreshToken };
}
// src/modules/auth/auth.service.ts

async function issueTokenPair(
  userId: string,
  role: 'admin' | 'recruiter' | 'applicant',
): Promise<{ accessToken: string; refreshToken: string }> {
  // Generate 256 bits of cryptographically random data.
  // toString('hex') produces a 64-character hex string.
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');

  // Hash the raw token before storing. SHA-256 of a 256-bit random value
  // is collision-resistant and cannot be reversed to obtain the raw token.
  const tokenHash = crypto
    .createHash('sha256')
    .update(rawRefreshToken)
    .digest('hex');

  // Date.now() is in milliseconds; multiply days → hours → minutes → seconds → ms.
  const expiresAt = new Date(
    Date.now() + config.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  );

  await createRefreshToken(userId, tokenHash, expiresAt);

  const accessToken = signAccessToken({ sub: userId, role });

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function refresh(
  rawToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  // Hash the incoming raw token the same way it was hashed at creation.
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Look up the hash. Returns null if the token does not exist or has expired.
  const tokenRow = await findRefreshTokenByHash(hash);
  if (!tokenRow) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Find the user to get their current role. The role in the DB may have
  // changed since the token was issued — always re-read from the source.
  const user = await findUserById(tokenRow.user_id);
  if (!user || user.status !== 'active') {
    // The user was deleted or suspended since this token was issued.
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Rotate: delete the old token hash before issuing a new pair.
  // If deleteRefreshTokenByHash succeeds and createRefreshToken (inside
  // issueTokenPair) fails, the user must log in again — acceptable.
  // Note: a concurrent request presenting the same token can call
  // findRefreshTokenByHash between this delete and the insert, and both
  // requests may issue new tokens. For a production system, a single
  // DELETE...RETURNING statement (find-and-delete atomically) eliminates
  // this race. For this course, the delete-first approach is used for clarity.
  await deleteRefreshTokenByHash(hash);

  return issueTokenPair(user.id, user.role);
}

export async function logout(rawToken: string): Promise<void> {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  // Delete the row. If it does not exist (already deleted, expired, or
  // the token is unknown), the DELETE affects 0 rows. Return normally either
  // way — logout is idempotent. Throwing here would punish correct client
  // behaviour (retrying logout after a network failure).
  await deleteRefreshTokenByHash(hash);
}
export async function verifyEmail(
  email: string,
  otp: string,
): Promise<void> {
  // Use a generic error for all failure paths to avoid revealing whether
  // an email is registered, whether an OTP exists, or whether it expired.
  const user = await findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid verification code');
  }

  // Already active: idempotent early return. Handles double-submit and
  // retries after a network failure on the success response.
  if (user.status === 'active') {
    return;
  }

  // Returns null if no row exists OR if the row has expired.
  const verification = await findEmailVerification(user.id);
  if (!verification) {
    throw new UnauthorizedError('Invalid verification code');
  }

  const submittedHash = hashOtp(otp);
  if (submittedHash !== verification.otp_hash) {
    throw new UnauthorizedError('Invalid verification code');
  }

  await activateUser(user.id);
  await deleteEmailVerificationsForUser(user.id);
}

export async function resendVerification(email: string): Promise<void> {
  const user = await findUserByEmail(email);

  // If the email is not registered, return normally — do not reveal
  // whether the address is in the system. The caller sees a 200 either way.
  if (!user) {
    return;
  }

  // If the account is already active, there is nothing to resend.
  // Return normally — do not error.
  if (user.status === 'active') {
    return;
  }

  // Only resend for pending accounts.
  // A suspended account should not receive a verification email.
  if (user.status !== 'pending') {
    return;
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  // createEmailVerification deletes any existing row before inserting the new one.
  // The old OTP is invalidated; user cannot use it after requesting a resend.
  await createEmailVerification(user.id, otpHash, expiresAt);
  await sendVerificationEmail(email, otp);
}

export async function acceptInvitation(input: AcceptInvitationInput) {
  // Step 1: Resolve the invitation
  const invitation = await findInvitationByToken(input.token);
  if (!invitation) {
    throw new BadRequestError('Invalid or expired invitation token.');
  }

  // Step 2: Email must match the invitation
  if (invitation.email.toLowerCase() !== input.email.toLowerCase()) {
    throw new BadRequestError('Invalid or expired invitation token.');
  }

  // Step 3: Resolve or create the user
  let userId: string;
  let userRole: string;

  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    if (existingUser.status !== 'active') {
      throw new ForbiddenError('Your account is not active.');
    }
    userId = existingUser.id;
    userRole = existingUser.role;
  } else {
    // New user — password required
    if (!input.password) {
      throw new BadRequestError('Password is required to create a new account.');
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    userId = await createVerifiedUser(input.email, passwordHash);
    userRole = 'recruiter';
  }

  // Step 4: Attach the user to the company
  await createRecruiterRow(userId, invitation.companyId, invitation.role);

  // Step 5: Delete the invitation (one-time use)
  await deleteInvitation(invitation.id);

  // Step 6: Issue tokens so the invitee is immediately logged in
  return generateTokenPair(userId, userRole as any);
}

