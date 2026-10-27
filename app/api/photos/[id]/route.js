import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinaryServer';

export async function PUT(request, { params }) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const { id } = await params;
    const body = await request.json();
    const existing = await db.photos.findOne({ id });
    if (!existing) {
      return NextResponse.json({ detail: 'Photo not found' }, { status: 404 });
    }
    const updated = {
      ...existing,
      ...body,
      id, // Preserve id
    };
    await db.photos.updateOne({ id }, { $set: updated });
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
    const existing = await db.photos.findOne({ id });
    if (!existing) {
      return NextResponse.json({ detail: 'Photo not found' }, { status: 404 });
    }
    if (existing.public_id) {
      try {
        await cloudinary.uploader.destroy(existing.public_id, { invalidate: true });
      } catch (e) {
        console.warn('Cloudinary destroy failed:', e);
      }
    }
    await db.photos.deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
