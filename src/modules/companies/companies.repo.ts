import { v4 as uuid } from 'uuid';
import { db } from '../../shared/db.js';
import { CreateCompanyInput } from './companies.schema.js';
import crypto from 'crypto';
import { config } from '../../shared/config.js';



export interface RecruiterCompany {
  companyId: string;
  companyRole: string;
}

export interface Company {
  id: string;
  name: string;
  status: string;
}

/**
 * Resolves the company_id and company_role for a given user.
 * Returns null if the user has no row in the recruiters table —
 * meaning they are not associated with any company.
 *
 * The userId comes from the verified JWT (req.user.userId).
 * This function is the bridge between the JWT and the company scope.
 */
export async function getRecruiterCompany(
  userId: string,
): Promise<RecruiterCompany | null> {
  const result = await db.query<{ company_id: string; company_role: string }>(
    `SELECT r.company_id, r.company_role
     FROM recruiters r
     WHERE r.user_id = $1`,
    [userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    companyId: result.rows[0].company_id,
    companyRole: result.rows[0].company_role,
  };
}

/**
 * Fetches company details by id.
 * This query is always called with a companyId resolved from
 * getRecruiterCompany — never from a URL parameter directly.
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  const result = await db.query<Company>(
    `SELECT
       id,
       name,
       CASE
          WHEN suspended = true THEN 'suspended'
          WHEN verified = true THEN 'verified'
         ELSE 'unverified'
       END AS status
     FROM companies
     WHERE id = $1`,
    [companyId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function createCompany(
  userId: string,
  input: CreateCompanyInput,
): Promise<{ companyId: string; name: string }> {
  const companyId = uuid();
  const recruiterId = uuid();

  await db.query('BEGIN');
  try {
    await db.query(
      `INSERT INTO companies (id, name, website, description, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [companyId, input.name, input.website ?? null, input.description ?? null],
    );
    await db.query(
      `INSERT INTO recruiters (id, user_id, company_id, company_role, created_at)
       VALUES ($1, $2, $3, 'owner', NOW())`,
      [recruiterId, userId, companyId],
    );
    await db.query('COMMIT');
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }

  return { companyId, name: input.name };
}

export async function createInvitation(
  companyId: string,
  email: string,
  role: string,
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const invitationId = uuid();

  await db.query(
    `INSERT INTO invitations (id, company_id, email, role, token_hash, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + ($6 || ' hours')::interval, NOW())`,
    [
      invitationId,
      companyId,
      email,
      role,
      tokenHash,
      String(config.INVITATION_EXPIRES_IN_HOURS),
    ],
  );

  return rawToken; // raw token returned to the caller; only the hash is stored
}

export async function findPendingInvitation(
  companyId: string,
  email: string,
): Promise<{ id: string } | null> {
  const result = await db.query(
    `SELECT id FROM invitations
     WHERE company_id = $1 AND email = $2 AND expires_at > NOW()`,
    [companyId, email],
  );
  return result.rows[0] ?? null;
}

export async function findExistingMember(
  companyId: string,
  email: string,
): Promise<{ id: string } | null> {
  const result = await db.query(
    `SELECT r.id FROM recruiters r
     JOIN users u ON u.id = r.user_id
     WHERE r.company_id = $1 AND u.email = $2`,
    [companyId, email],
  );
  return result.rows[0] ?? null;
}

export async function listCompanyMembers(companyId: string): Promise<
  Array<{
    recruiterId: string;
    userId: string;
    email: string;
    companyRole: string;
    joinedAt: string;
  }>
> {
  const result = await db.query(
    `SELECT
       r.id AS "recruiterId",
       r.user_id AS "userId",
       u.email,
       r.company_role AS "companyRole",
       r.created_at AS "joinedAt"
     FROM recruiters r
     JOIN users u ON u.id = r.user_id
     WHERE r.company_id = $1
     ORDER BY r.created_at ASC`,
    [companyId],
  );
  return result.rows;
}

export async function getMemberById(
  recruiterId: string,
  companyId: string,
): Promise<{ userId: string; companyRole: string } | null> {
  const result = await db.query(
    `SELECT user_id AS "userId", company_role AS "companyRole"
     FROM recruiters
     WHERE id = $1 AND company_id = $2`,
    [recruiterId, companyId],
  );
  return result.rows[0] ?? null;
}

export async function updateMemberRole(
  recruiterId: string,
  companyId: string,
  newRole: string,
): Promise<void> {
  await db.query(
    `UPDATE recruiters SET company_role = $1
     WHERE id = $2 AND company_id = $3`,
    [newRole, recruiterId, companyId],
  );
}

export async function removeMember(
  recruiterId: string,
  companyId: string,
): Promise<void> {
  await db.query(
    `DELETE FROM recruiters WHERE id = $1 AND company_id = $2`,
    [recruiterId, companyId],
  );
}