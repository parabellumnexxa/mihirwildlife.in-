import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

function slugify(text) {
  const s = (text || '').replace(/[^\w\s-]/g, '').trim().toLowerCase();
  return s.replace(/[-\s]+/g, '-') || 'post';
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const post = await db.blog_posts.findOne({
      $or: [{ slug }, { id: slug }],
    });
    if (!post) {
      return NextResponse.json({ detail: 'Blog post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const { slug } = await params;
    const existing = await db.blog_posts.findOne({
      $or: [{ slug }, { id: slug }],
    });
    if (!existing) {
      return NextResponse.json({ detail: 'Blog post not found' }, { status: 404 });
    }
    const body = await request.json();
    const data = {};
    for (const [key, val] of Object.entries(body)) {
      if (val !== undefined && val !== null) {
        data[key] = val;
      }
    }
    if (data.slug && data.slug !== existing.slug) {
      data.slug = slugify(data.slug);
    }
    const updated = { ...existing, ...data };
    await db.blog_posts.updateOne({ id: existing.id }, { $set: updated });
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
    const { slug } = await params;
    const existing = await db.blog_posts.findOne({
      $or: [{ slug }, { id: slug }],
    });
    if (!existing) {
      return NextResponse.json({ detail: 'Blog post not found' }, { status: 404 });
    }
    await db.blog_posts.deleteOne({ id: existing.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
