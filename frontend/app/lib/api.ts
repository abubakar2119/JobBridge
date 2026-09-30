import { cookies } from 'next/headers';

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = (await cookies()).get('access_token')?.value;

  console.log('API FETCH PATH:', path);
  console.log('ACCESS TOKEN EXISTS:', !!token);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    },
  );

  const body = await res.json().catch(() => ({}));

  console.log('API STATUS:', res.status);
  console.log('API RESPONSE:', body);

  if (!res.ok) {
    throw new Error(
      body.error?.message ??
      body.message ??
      `HTTP ${res.status}`,
    );
  }

  return body;
}