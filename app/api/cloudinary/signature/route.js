import { NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
import { generateSignature } from '@/lib/cloudinaryServer';

export async function GET(request) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'portfolio/photos';
    if (!folder.startsWith('portfolio/')) {
      return NextResponse.json({ detail: 'Invalid folder path' }, { status: 400 });
    }
    const sigData = generateSignature(folder);
    return NextResponse.json(sigData);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
