'use client';

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import EditUserDialog from "../EditUserDialog";
import { useState } from "react";

export type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: "admin" | "manager";
};

type UserTableProps = {
  users: User[];
  onDeleteUser: (id: string) => void;
  onSetUserRole: (userId: string, role: "admin" | "manager") => void;
  currentUserId: string;
  isCurrentUserAdmin: boolean;
};

export default function UserTable({
  users,
  onDeleteUser,
  onSetUserRole,
  currentUserId,
  isCurrentUserAdmin
}: UserTableProps) {
  const [openEditDialogId, setOpenEditDialogId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Имя пользователя</TableHead>
          <TableHead>Полное имя</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead className="w-[150px]">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium text-blue-600">
              {user.username}
            </TableCell>
            <TableCell>{user.fullName}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={
                  `w-32 display flex justify-center items-center ${user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`
                }
              >
                {user.role === "admin" ? "Админ" : "Модератор"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-40 px-2 py-1 text-xs whitespace-normal h-auto min-h-[2rem]"
                  onClick={() => onSetUserRole(user.id, user.role === 'manager' ? 'admin' : 'manager')}
                >
                  {user.role === 'manager' ? 'Сделать админом' : 'Сделать модератором'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Удалить</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
