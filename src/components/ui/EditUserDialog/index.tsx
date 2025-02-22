// src/components/ui/EditUserDialog/index.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/components/shared/lib/zod";
import { z } from "zod";

const editUserSchema = signUpSchema.omit({ email: true });
type FormValues = z.infer<typeof editUserSchema>;

interface EditUserProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: "admin" | "manager";
  };
  onEdit: (data: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    password: string;
    role: "admin" | "manager";
  }) => Promise<void> | void;
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  onClose?: () => void;
}

export default function EditUserDialog({
  user,
  onEdit,
  currentUserId,
  isCurrentUserAdmin,
  onClose,
}: EditUserProps) {
  const [pending, setPending] = useState(false);
  const canEdit = isCurrentUserAdmin || user.id === currentUserId;

  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      fullName: user.fullName,
      password: "",
      role: user.role,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setPending(true);
    const payload = {
      id: user.id,
      username: values.username,
      fullName: values.fullName,
      email: user.email, 
      password: values.password,
      role: isCurrentUserAdmin ? values.role : user.role,
    };
    try {
      await onEdit(payload);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error editing user:", error);
    }
    setPending(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Редактировать пользователя</h2>
      <form id="editUserForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="username">Имя</Label>
          <Input id="username" {...register("username")} disabled={!canEdit} />
        </div>
        <div>
          <Label htmlFor="fullName">Полное имя</Label>
          <Input id="fullName" {...register("fullName")} disabled={!canEdit} />
        </div>
        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" type="password" {...register("password")} disabled={canEdit} />
        </div>
        {isCurrentUserAdmin && (
          <div>
            <Label htmlFor="role">Роль</Label>
            <select
              id="role"
              {...register("role")}
              disabled={!canEdit}
              className="w-full p-2 border rounded"
            >
              <option value="admin">Админ</option>
              <option value="manager">Менеджер</option>
            </select>
          </div>
        )}
      </form>
      <Button type="submit" form="editUserForm" className="w-full mt-4" disabled={!canEdit || pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
