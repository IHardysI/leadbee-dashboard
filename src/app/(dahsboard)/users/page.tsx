import { clerkClient } from '@clerk/nextjs/server';
import { removeRole, setRole } from '@/components/entities/user/model/actions';

import UserTable, { type User } from '@/components/ui/UserTable';
import type { ReactNode } from 'react';

import UsersTableClient from './UsersTableClient';

export default async function UsersTablePage() {
  // Fetch users on the server
  const client = await clerkClient();
  const clerkUsers = (await client.users.getUserList()).data;
  const users: User[] = clerkUsers.map((u: any) => ({
    id: u.id,
    username: u.username || '',
    fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    email: u.emailAddresses?.[0]?.emailAddress || '',
    role: u.publicMetadata && u.publicMetadata.role ? (u.publicMetadata.role as "admin" | "manager") : 'manager'
  }));

  // In a real application, these would be derived from session/auth context
  const currentUserId = 'CURRENT_USER_ID';
  const isCurrentUserAdmin = true;

  return (
    <UsersTableClient
      users={users}
      currentUserId={currentUserId}
      isCurrentUserAdmin={isCurrentUserAdmin}
    />
  );
}
