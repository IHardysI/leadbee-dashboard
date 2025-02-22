import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, fullName, email, password, role } = body;
    const finalUsername = username || (email ? email.split('@')[0] : '');
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const client = await clerkClient() as any;
    const newUser = await client.users.createUser({
      username: finalUsername,
      firstName: firstName,
      lastName: lastName,
      emailAddress: [email],
      password: password,
      publicMetadata: { role }
    });

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    const errorMessage = error instanceof Error ? error.message : "Error creating user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 