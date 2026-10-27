import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const { id } = await params;
    const existing = await db.contact_messages.findOne({ id });
    if (!existing) {
      return NextResponse.json({ detail: 'Message not found' }, { status: 404 });
    }
    await db.contact_messages.deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
