import { NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) { return request.cookies.get('access_token') ? NextResponse.next() : NextResponse.redirect(new URL('/login', request.url)); }
export const config = { matcher: ['/dashboard/:path*'] };
