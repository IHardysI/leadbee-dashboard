'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import AddUserDialog from '@/components/ui/AddUserDialog';
import { VisuallyHidden } from '@/components/ui/visuallyHidden';
import UserTable, { User } from '@/components/ui/UserTable';

interface UsersTableClientProps {
  users: User[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
}

export default function UsersTableClient({ users, currentUserId, isCurrentUserAdmin }: UsersTableClientProps) {
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [userList, setUserList] = useState<User[]>(users);

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to delete user:', errorData);
      } else {
        console.log('Successfully deleted user with id', id);
        setUserList(prev => prev.filter(user => user.id !== id));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = async (user: User) => {
    console.log('Editing user', user);
  };

  const handleSetUserRole = async (userId: string, role: "admin" | "manager") => {
    try {
      const res = await fetch('/api/set-user-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to set user role:', errorData);
      } else {
        console.log('Successfully set user role for:', userId);
        setUserList(prev => prev.map(user => user.id === userId ? { ...user, role } : user));
      }
    } catch (error) {
      console.error('Error setting user role:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border overflow-hidden">
        <div className="bg-muted px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Пользователи</h2>
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cYellow/90 hover:bg-cYellow text-white rounded-full w-10 h-10" size="icon">
                <UserPlus className="h-5 w-5" />
                <span className="sr-only">Добавить нового пользователя</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>
                <VisuallyHidden>Добавить пользователя</VisuallyHidden>
              </DialogTitle>
              <AddUserDialog
                onAddUser={(newUser) => { setUserList(prev => [...prev, newUser]); setOpenAddDialog(false); }}
                onClose={() => setOpenAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <UserTable
          users={userList}
          onDeleteUser={handleDeleteUser}
          onSetUserRole={handleSetUserRole}
          currentUserId={currentUserId}
          isCurrentUserAdmin={isCurrentUserAdmin}
        />
      </div>
    </div>
  );
} 