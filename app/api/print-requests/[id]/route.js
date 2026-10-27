import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const { id } = await params;
    const body = await request.json();
    const existing = await db.print_requests.findOne({ id });
    if (!existing) {
      return NextResponse.json({ detail: 'Print request not found' }, { status: 404 });
    }
    const updated = {
      ...existing,
      ...body,
      id,
    };
    await db.print_requests.updateOne({ id }, { $set: updated });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const { id } = await params;
    const existing = await db.print_requests.findOne({ id });
    if (!existing) {
      return NextResponse.json({ detail: 'Print request not found' }, { status: 404 });
    }
    await db.print_requests.deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
