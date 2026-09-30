'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function suspendUser(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';

  const id = formData.get('id') as string;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}/suspend`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to suspend user: ${res.status}`);
  }

  revalidatePath('/admin/users');
}

export async function activateUser(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';

  const id = formData.get('id') as string;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}/activate`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to activate user: ${res.status}`);
  }

  revalidatePath('/admin/users');
}