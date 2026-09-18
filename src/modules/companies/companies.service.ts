import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js';
import { sendInvitationEmail } from './companies.email.js';
import {
  getRecruiterCompany,
  getCompanyById,
  type Company,
  createCompany,
  findPendingInvitation,
  createInvitation,
  findExistingMember,
  getMemberById,
  updateMemberRole,
  removeMember,
  listCompanyMembers,
} from './companies.repo.js';
import { CreateCompanyInput,InviteMemberInput, UpdateMemberInput} from './companies.schema.js';

/**
 * Returns the company associated with the authenticated recruiter.
 *
 * userId comes from req.user.userId — the verified JWT payload.
 * It is resolved through the recruiters table to obtain company_id.
 * The companies query is then scoped to that company_id.
 *
 * The caller never controls which company is queried.
 */
export async function getMyCompany(userId: string): Promise<Company> {
  const recruiter = await getRecruiterCompany(userId);

  if (!recruiter) {
    throw new NotFoundError('No company associated with this account');
  }

  const company = await getCompanyById(recruiter.companyId);

  if (!company) {
    // The recruiters row references a company_id that no longer exists.
    // This indicates a data integrity problem.
    throw new NotFoundError('Company not found');
  }

  return company;
}

export async function openWorkspace(userId: string, input: CreateCompanyInput) {
  // Guard: a user can own at most one company
  const existing = await getRecruiterCompany(userId);
  if (existing) {
    throw new ConflictError('You already have a company workspace.');
  }

  return createCompany(userId, input);
}


// export async function inviteMember(userId: string, input: InviteInput) {
//   const company = await getRecruiterCompany(userId);
//   if (!company) throw new ForbiddenError('No company workspace found.');

//   assertCompanyRole(company.companyRole, ['owner', 'hr_manager']);

//   // ... rest of the invite logic
// }

// src/modules/companies/companies.service.ts
export function assertCompanyRole(companyRole: string, allowed: string[]) {
  if (!allowed.includes(companyRole)) {
    throw new ForbiddenError('You do not have permission to perform this action.');
  }
}

export async function inviteMember(userId: string, input: InviteMemberInput) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  assertCompanyRole(company.companyRole, ['owner', 'hr_manager']);

  const existing = await findExistingMember(company.companyId, input.email);
  if (existing) throw new ConflictError('This person is already a member of your company.');

  const pending = await findPendingInvitation(company.companyId, input.email);
  if (pending) throw new ConflictError('A pending invitation for this email already exists.');

  const rawToken = await createInvitation(company.companyId, input.email, input.role);

  await sendInvitationEmail(input.email, rawToken);
}

export async function getMembers(userId: string) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  // owner and hr_manager can view the member list
  assertCompanyRole(company.companyRole, ['owner', 'hr_manager']);

  return listCompanyMembers(company.companyId);
}

export async function changeMemberRole(
  userId: string,
  recruiterId: string,
  input: UpdateMemberInput,
) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  assertCompanyRole(company.companyRole, ['owner']);

  const member = await getMemberById(recruiterId, company.companyId);
  if (!member) throw new NotFoundError('Member not found.');

  // Cannot change the owner's own role via this endpoint
  if (member.userId === userId) {
    throw new ForbiddenError('You cannot change your own role.');
  }

  // Cannot downgrade or change another owner (there is only one, but guard against it)
  if (member.companyRole === 'owner') {
    throw new ForbiddenError('The owner role cannot be changed via this endpoint.');
  }

  await updateMemberRole(recruiterId, company.companyId, input.role);
}

export async function deleteMember(userId: string, recruiterId: string) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  assertCompanyRole(company.companyRole, ['owner', 'hr_manager']);

  const member = await getMemberById(recruiterId, company.companyId);
  if (!member) throw new NotFoundError('Member not found.');

  // Cannot remove yourself
  if (member.userId === userId) {
    throw new ForbiddenError('You cannot remove yourself from the company.');
  }

  await removeMember(recruiterId, company.companyId);
}