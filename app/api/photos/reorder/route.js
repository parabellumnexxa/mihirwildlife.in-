import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const { ids } = await request.json();
    if (!ids || !ids.length) {
      return NextResponse.json({ success: true });
    }
    const ops = ids.map((id, index) => ({
      updateOne: {
        filter: { id },
        update: { $set: { order: index } },
      },
    }));
    await db.photos.bulkWrite(ops);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
