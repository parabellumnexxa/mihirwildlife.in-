import { NextResponse } from 'next/server';
import { ADMIN_PASSWORD } from '@/lib/auth';

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ detail: 'Invalid password' }, { status: 401 });
    }
    return NextResponse.json({ token: ADMIN_PASSWORD });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
