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
    const messages = await db.contact_messages.find({}, 'created_at', -1);
    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const msg = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      message: body.message,
      created_at: new Date().toISOString(),
    };
    await db.contact_messages.insertOne(msg);

    const html = `
    <h2 style='font-family:sans-serif'>New contact enquiry</h2>
    <p style='font-family:sans-serif'><strong>Name:</strong> ${msg.name}<br/>
    <strong>Email:</strong> ${msg.email}</p>
    <p style='font-family:sans-serif'><strong>Message:</strong><br/>${msg.message}</p>
    `;
    await sendOwnerEmail({
      subject: `New enquiry from ${msg.name}`,
      html,
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
