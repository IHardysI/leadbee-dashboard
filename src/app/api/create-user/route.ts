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
    const payload: {
      username: string;
      first_name: string;
      last_name: string;
      email_address: string[];
      public_metadata: { role: string };
      password?: string;
    } = {
      username: finalUsername,
      first_name: firstName,
      last_name: lastName,
      email_address: [email],
      public_metadata: { role }
    };

    if (password) {
      payload.password = password;
    }

    const newUser = await client.users.createUser(payload);
    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    console.error("Error creating user:", error);
    const errorMessage = error?.message || "Error creating user";
    const errorDetails = error?.response?.data || JSON.stringify(error, null, 2);
    return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: 500 });
  }
} 