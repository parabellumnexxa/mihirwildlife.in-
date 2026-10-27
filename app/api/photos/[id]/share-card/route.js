import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateShareCard } from '@/lib/cloudinaryServer';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const doc = await db.photos.findOne({ id });
    if (!doc) {
      return NextResponse.json({ detail: 'Photo not found' }, { status: 404 });
    }
    if (!doc.public_id) {
      return NextResponse.json({ url: doc.image_url });
    }
    const url = generateShareCard(doc.public_id, doc.title || 'Wildlife');
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
