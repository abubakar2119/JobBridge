import {db} from '../../shared/db.js';

// List companies; optionally filter by status
export async function listCompanies(status?: string) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`c.status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT
       c.id,
       c.name,
       c.status,
       c.created_at,
       u.email AS owner_email
     FROM companies c
     LEFT JOIN recruiters r
       ON r.company_id = c.id
       AND r.company_role = 'owner'
     LEFT JOIN users u
       ON u.id = r.user_id
     ${where}
     ORDER BY c.created_at DESC`,
    params
  );

  return result.rows;
}

// Find a single company by id
export async function findCompanyById(id: string) {
  const result = await db.query(
    `SELECT id, name, status FROM companies WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

// Set company status and return updated row
export async function setCompanyStatus(id: string, status: string) {
  const result = await db.query(
    `UPDATE companies SET status = $1 WHERE id = $2
     RETURNING id, name, status`,
    [status, id]
  );
  return result.rows[0] ?? null;
}

// Close all open jobs for a company (called on suspension)
export async function closeOpenJobsForCompany(companyId: string) {
  await db.query(
    `UPDATE jobs SET status = 'closed'
     WHERE company_id = $1 AND status = 'open'`,
    [companyId]
  );
}

// List all jobs with optional status and companyId filters
export async function listJobs(status?: string, companyId?: string) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`j.status = $${params.length}`);
  }
  if (companyId) {
    params.push(companyId);
    conditions.push(`j.company_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT j.id, j.title, j.status, j.created_at, c.name AS company_name
     FROM jobs j
     JOIN companies c ON c.id = j.company_id
     ${where}
     ORDER BY j.created_at DESC`,
    params
  );
  return result.rows;
}

// Find a single job by id
export async function findJobById(id: string) {
  const result = await db.query(
    `SELECT id, title, status FROM jobs WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

// Force-close a job
export async function forceCloseJob(id: string) {
  const result = await db.query(
    `UPDATE jobs SET status = 'closed' WHERE id = $1
     RETURNING id, title, status`,
    [id]
  );
  return result.rows[0] ?? null;
}

// List all users with optional role and status filters
export async function listUsers(role?: string, status?: string) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (role) {
    params.push(role);
    conditions.push(`u.role = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`u.status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT id, email, role, status, created_at
     FROM users u
     ${where}
     ORDER BY created_at DESC`,
    params
  );
  return result.rows;
}

// Find a single user by id
export async function findUserById(id: string) {
  const result = await db.query(
    `SELECT id, email, role, status FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

// Update user status
export async function setUserStatus(id: string, status: string) {
  const result = await db.query(
    `UPDATE users SET status = $1 WHERE id = $2
     RETURNING id, email, role, status`,
    [status, id]
  );
  return result.rows[0] ?? null;
}

// Delete all refresh tokens for a user (session invalidation)
export async function deleteRefreshTokensForUser(userId: string) {
  await db.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );
}