import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const filter = {};
    if (category && category.toLowerCase() !== 'all') {
      filter.category = category;
    }
    const photos = await db.photos.find(filter, 'order', 1);
    return NextResponse.json(photos);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const body = await request.json();
    const photo = {
      id: crypto.randomUUID(),
      title: body.title,
      title_gu: body.title_gu || null,
      category: body.category || 'Wildlife',
      location: body.location || null,
      collection: body.collection || null,
      story: body.story || null,
      camera: body.camera || null,
      lens: body.lens || null,
      settings: body.settings || null,
      image_url: body.image_url,
      public_id: body.public_id || null,
      width: body.width || null,
      height: body.height || null,
      featured: Boolean(body.featured),
      order: body.order ?? 0,
      created_at: new Date().toISOString(),
    };
    await db.photos.insertOne(photo);
    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
