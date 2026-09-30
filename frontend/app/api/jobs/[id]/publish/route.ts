// frontend/app/api/jobs/[id]/publish/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const token = (await cookies()).get("access_token")?.value;
  const res = await fetch(`${process.env.API_URL}/api/jobs/${params.id}/publish`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return NextResponse.json(await res.json(), { status: res.status });
}