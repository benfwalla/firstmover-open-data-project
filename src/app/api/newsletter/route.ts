import { NextResponse } from 'next/server';

/**
 * Note: This is currently only used as a dummy route for testing newsletter submissions locally
 */

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: 'Unable to subscribe right now.' }, { status: 500 });
  }
}
