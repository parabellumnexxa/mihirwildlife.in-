import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function POST(request) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const photos = await db.photos.find({});
    return NextResponse.json({
      status: 'success',
      imported: 0,
      total: photos.length,
      message: `Database currently contains ${photos.length} photos.`,
    });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
