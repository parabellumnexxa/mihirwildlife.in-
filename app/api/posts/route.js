import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
import crypto from 'crypto';

function slugify(text) {
  const s = (text || '').replace(/[^\w\s-]/g, '').trim().toLowerCase();
  return s.replace(/[-\s]+/g, '-') || 'post';
}

const DEFAULT_SAMPLE_POST = {
  id: 'waterbird-dynamics-junagadh-wetlands',
  slug: 'waterbird-dynamics-junagadh-wetlands',
  title: "Waterbird Dynamics: Tracking Hunting Behaviours in Junagadh's Wetlands",
  category: 'Conservation & Fieldwork',
  author: 'Mihir Ranva',
  published_date: 'October 24, 2026',
  excerpt:
    'Fieldwork requires patience before the frame. In this study, we break down how analytical tracking systems help map out the migratory movements of local species across the wetlands.',
  cover_image:
    'https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/lion_pride_13_q5bwgp.jpg',
  cover_caption: 'Figure 1: Rare documentation of hunting sequences captured at Lal Dhori.',
  reading_time: '4 min read',
  content: `<p>Fieldwork requires patience before the frame. In this study, we break down how analytical tracking systems help map out the migratory movements of local species across the wetlands.</p>

<img src="https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/lion_pride_13_q5bwgp.jpg" alt="Indian Cormorants hunting bullfrogs">
<span class="img-caption">Figure 1: Rare documentation of hunting sequences captured at Lal Dhori.</span>

<h2>The Intersection of Systems and Field Biology</h2>
<p>By treating photography as scientific evidence rather than simple spectacle, we feed crucial dataset observations straight to environmental networks like the Bombay Natural History Society.</p>

<p>Avian species exhibit nuanced behavioral patterns during twilight hours that standard observation easily misses. By combining long-duration sensor data with precision telephoto observation, our Junagadh field surveys document feeding strategies and territorial disputes in unprecedented detail.</p>`,
  created_at: '2026-10-24T12:00:00+00:00',
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const filter = {};
    if (category && category.toLowerCase() !== 'all') {
      filter.category = category;
    }
    let posts = await db.blog_posts.find(filter, 'created_at', -1);
    if (!posts.length && !category) {
      await db.blog_posts.insertOne(DEFAULT_SAMPLE_POST);
      posts = [DEFAULT_SAMPLE_POST];
    }
    return NextResponse.json(posts);
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
    let slug = slugify(body.slug || body.title);
    const existing = await db.blog_posts.findOne({ slug });
    if (existing) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const post = {
      id: crypto.randomUUID(),
      slug,
      title: body.title,
      category: body.category || 'Conservation & Fieldwork',
      author: body.author || 'Mihir Ranva',
      published_date:
        body.published_date ||
        new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      excerpt: body.excerpt || null,
      content: body.content,
      cover_image: body.cover_image || null,
      cover_caption: body.cover_caption || null,
      reading_time: body.reading_time || '4 min read',
      created_at: new Date().toISOString(),
    };

    await db.blog_posts.insertOne(post);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
