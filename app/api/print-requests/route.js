import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
import { sendOwnerEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET(request) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }
    const requests = await db.print_requests.find({}, 'created_at', -1);
    return NextResponse.json(requests);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const req = {
      id: crypto.randomUUID(),
      photo_id: body.photo_id || null,
      photo_title: body.photo_title || null,
      name: body.name,
      email: body.email,
      purpose: body.purpose || 'print',
      print_size: body.print_size || null,
      print_price: body.print_price || null,
      message: body.message || null,
      created_at: new Date().toISOString(),
    };
    await db.print_requests.insertOne(req);

    const label = req.purpose === 'print' ? 'Print' : 'License';
    const html = `
    <h2 style='font-family:sans-serif'>New ${label} request</h2>
    <p style='font-family:sans-serif'><strong>Image:</strong> ${req.photo_title || 'General enquiry'}<br/>
    <strong>Type:</strong> ${label}<br/>
    <strong>Size:</strong> ${req.print_size || '-'}<br/>
    <strong>Price:</strong> ${req.print_price || '-'}<br/>
    <strong>Name:</strong> ${req.name}<br/>
    <strong>Email:</strong> ${req.email}</p>
    <p style='font-family:sans-serif'><strong>Message:</strong><br/>${req.message || '-'}</p>
    `;
    await sendOwnerEmail({
      subject: `${label} request · ${req.photo_title || 'General'}`,
      html,
    });

    return NextResponse.json(req, { status: 201 });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
