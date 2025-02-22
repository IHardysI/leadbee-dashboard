import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, role } = body;
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    const client = await clerkClient();
    const updatedUser = await client.users.updateUser(userId, {
      publicMetadata: { role }
    });
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
} 