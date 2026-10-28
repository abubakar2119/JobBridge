'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function closeJob(formData: FormData) {
  const cookieStore = await cookies();
 const token = cookieStore.get('access_token')?.value ?? '';
  const id = formData.get('id') as string;
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/jobs/${id}/close`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
  );
  revalidatePath('/admin/jobs');
}

