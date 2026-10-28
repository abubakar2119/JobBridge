'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function patchCompany(id: string, action: 'verify' | 'suspend'|'pending') {
 const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/companies/${id}/${action}`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
  );

  revalidatePath('/admin/companies');
}

export async function verifyCompany(formData: FormData) {
  await patchCompany(formData.get('id') as string, 'verify');
}

export async function suspendCompany(formData: FormData) {
  await patchCompany(formData.get('id') as string, 'suspend');
}

export async function pendingCompany(formData: FormData) {
  await patchCompany(formData.get('id') as string, 'pending');
}