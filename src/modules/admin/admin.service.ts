import * as repo from './admin.repo.js';
import { redis } from '../../shared/redis.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors.js';

export async function listCompanies(status?: string) {
  return repo.listCompanies(status);
}

export async function verifyCompany(id: string) {
  const company = await repo.findCompanyById(id);
  if (!company) throw new NotFoundError('Company not found');
  if (company.status === 'verified') throw new ConflictError('Company is already verified');
  return repo.setCompanyStatus(id, 'verified');
}

export async function pendingCompany(id: string) {
  const company = await repo.findCompanyById(id);
  if (!company) throw new NotFoundError('Company not found');
  if (company.status === 'pending') throw new ConflictError('Company is already pending');
  return repo.setCompanyStatus(id, 'pending');
}

export async function suspendCompany(id: string) {
  const company = await repo.findCompanyById(id);
  if (!company) throw new NotFoundError('Company not found');
  if (company.status === 'suspended') throw new ConflictError('Company is already suspended');

  const updated = await repo.setCompanyStatus(id, 'suspended');

  // Close all open jobs for this company
  await repo.closeOpenJobsForCompany(id);

  // Purge the public job-board cache (same key as ch45)
  await redis.del('jobs:public:page1');

  return updated;
}

export async function listJobs(status?: string, companyId?: string) {
  return repo.listJobs(status, companyId);
}

export async function forceCloseJob(id: string) {
  const job = await repo.findJobById(id);
  if (!job) throw new NotFoundError('Job not found');
  if (job.status === 'closed') throw new ConflictError('Job is already closed');
  return repo.forceCloseJob(id);
}

export async function listUsers(role?: string, status?: string) {
  return repo.listUsers(role, status);
}

export async function suspendUser(adminId: string, userId: string) {
  // Prevent an admin from suspending themselves
  if (adminId === userId) {
    throw new ForbiddenError('Admins cannot suspend themselves');
  }

  const user = await repo.findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.status === 'suspended') throw new ConflictError('User is already suspended');

  const updated = await repo.setUserStatus(userId, 'suspended');

  // Invalidate all active refresh tokens for this user
  await repo.deleteRefreshTokensForUser(userId);

  return updated;
}

export async function activateUser(userId: string) {
  const user = await repo.findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.status === 'active') throw new ConflictError('User is already active');
  return repo.setUserStatus(userId, 'active');
}