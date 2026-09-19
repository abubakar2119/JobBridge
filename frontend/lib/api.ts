import { cookies } from 'next/headers';
export async function apiFetch(path: string, options: RequestInit = {}) { const token = (await cookies()).get('access_token')?.value; return fetch(`${process.env.API_URL}${path}`, {...options, headers:{'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`} : {}), ...options.headers}}); }
