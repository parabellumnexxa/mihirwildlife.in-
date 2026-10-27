import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

const DEFAULT_PRINT_OPTIONS = [
  { size: 'A4 · 210×297mm', price: '2,500' },
  { size: 'A3 · 297×420mm', price: '4,500' },
  { size: 'A2 · 420×594mm', price: '7,500' },
  { size: 'A1 · 594×841mm (Museum)', price: '12,000' },
];

const DEFAULT_COLLECTIONS = {
  'Big Cats of Gir': {
    cover_public_id: 'lion_pride_3_jwn89m',
    caption:
      "The last refuge of the Asiatic lion and the elusive leopard — Gir's great predators, watched with patience and quiet respect.",
  },
  'Raptors & Owls': {
    cover_public_id: '070A1006_ncv8gi',
    caption:
      "Eyes of the forest. The hunters that rule Gujarat's open skies and its shadowed, tangled canopies.",
  },
  'Wetlands of Junagadh': {
    cover_public_id: 'lion_pride_13_q5bwgp',
    caption:
      "Where water meets the city — flamingos, kingfishers and waders that turn Junagadh's wetlands into a living theatre.",
  },
  'Songbirds of Gujarat': {
    cover_public_id: 'lion_pride_7_tphqdl',
    caption:
      'The smaller voices of the wild — larks, pittas and flycatchers, each a splash of colour in the scrub and forest edge.',
  },
  'After Dark': {
    cover_public_id: 'lion_pride_1_vjwkfm',
    caption:
      "When the forest sleeps, the sky wakes. Long nights spent under some of Gujarat's darkest, star-flooded skies.",
  },
  Reptiles: {
    cover_public_id: '',
    caption:
      'The cold-blooded and the misunderstood — snakes, lizards and the reptiles that keep the ecosystem in balance.',
  },
};

const DEFAULT_CATEGORIES = ['Birds', 'Wildlife', 'Behavior', 'Ecosystems'];

const DEFAULT_SITE_SETTINGS = {
  id: 'site',
  logo_url: 'https://res.cloudinary.com/uq0zgy3i/image/upload/Brown_2_bsk3ns.png',
  logo_public_id: 'Brown_2_bsk3ns',
  hero_image_url:
    'https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/lion_pride_9_de9akv.jpg',
  hero_public_id: 'lion_pride_9_de9akv',
  about_image_url:
    'https://customer-assets.emergentagent.com/job_ffe20947-a722-4c4e-91fc-0363cc8eaee7/artifacts/0d85h6jz_about%20Photo.jpg',
  about_public_id: null,
  contact_email: 'mihirwildlife@gmail.com',
  instagram: '',
  currency: 'INR',
  print_options: DEFAULT_PRINT_OPTIONS,
  collections: DEFAULT_COLLECTIONS,
  categories: DEFAULT_CATEGORIES,
  blog_url: 'https://medium.com/@mihirwildlife',
  show_blog: true,
};

export async function GET() {
  try {
    let site = await db.site_settings.findOne({ id: 'site' });
    if (!site) {
      site = { ...DEFAULT_SITE_SETTINGS };
      await db.site_settings.insertOne(site);
    }
    return NextResponse.json(site);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const updates = await request.json();
    let site = await db.site_settings.findOne({ id: 'site' });
    if (!site) {
      site = { ...DEFAULT_SITE_SETTINGS };
    }
    const filteredUpdates = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined && val !== null) {
        filteredUpdates[key] = val;
      }
    }
    const updated = { ...site, ...filteredUpdates, id: 'site' };
    await db.site_settings.updateOne({ id: 'site' }, { $set: updated }, { upsert: true });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
