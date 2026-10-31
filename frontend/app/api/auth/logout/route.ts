
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  try {
    
    const res = await fetch(
      `${process.env.API_URL}/api/auth/logout`,
      {
        method: 'POST',
        headers: {
          ...(accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      }
    );

    
    const response = NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
      303
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    console.error('Logout request failed:', error);

    const response = NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
      303
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  }
}
