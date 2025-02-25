"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/components/shared/lib/zod";
import { z } from "zod";
import { User } from '@/components/ui/UserTable';
import { Eye, EyeOff } from 'lucide-react';

export type FormValues = z.infer<typeof signUpSchema>;

export interface AddUserDialogProps {
  onClose?: () => void;
  onAddUser?: (newUser: User) => void;
}

export default function AddUserDialog({ onClose, onAddUser }: AddUserDialogProps) {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      role: "moderator",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setErrorMessage(null);
    setPending(true);
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const result = await response.json();
      if (response.ok && result.user) {
        console.log("User created:", result.user);
        const createdUser = result.user;
        const newUser = {
          id: createdUser.id,
          username: createdUser.username || "",
          fullName: `${createdUser.firstName || ""} ${createdUser.lastName || ""}`.trim(),
          email: Array.isArray(createdUser.emailAddress) ? createdUser.emailAddress[0] : "",
          role: createdUser.publicMetadata?.role || "moderator"
        };
        if (onAddUser) onAddUser(newUser);
        if (onClose) onClose();
      } else {
        console.error("Ошибка при создании пользователя:", result.error);
        if (result.details) {
          let details;
          try {
            details = typeof result.details === 'string' ? JSON.parse(result.details) : result.details;
          } catch (e) {
            details = result.details;
          }
          if (details.errors && Array.isArray(details.errors)) {
            const passwordError = details.errors.find((err: any) => err.meta && err.meta.paramName === 'password');
            if (passwordError) {
              if (passwordError.code === "form_password_pwned") {
                passwordError.message = "Пароль обнаружен в утечке данных. Для безопасности аккаунта, пожалуйста, используйте другой пароль.";
              }
              setError("password", { type: "manual", message: passwordError.message });
            } else {
              setErrorMessage(result.error || "Ошибка при создании пользователя.");
            }
          } else {
            setErrorMessage(result.error || "Ошибка при создании пользователя.");
          }
        } else {
          setErrorMessage(result.error || "Ошибка при создании пользователя.");
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage(typeof error === 'string' ? error : "Error creating user");
    }
    setPending(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Добавить нового пользователя
      </h2>
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
      <form id="addUserForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="username" className="block mb-1">Имя пользователя</Label>
          <Input id="username" placeholder="Введите имя пользователя" {...register("username")} />
        </div>
        <div>
          <Label htmlFor="fullName" className="block mb-1">Полное имя</Label>
          <Input id="fullName" placeholder="Введите полное имя" {...register("fullName")} />
        </div>
        <div>
          <Label htmlFor="email" className="block mb-1">Email</Label>
          <Input id="email" type="email" placeholder="Введите email" {...register("email")} />
        </div>
        <div>
          <Label htmlFor="password" className="block mb-1">Пароль</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Введите пароль" {...register("password")} className="w-full pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="role" className="block mb-1">Роль</Label>
          <select
            id="role"
            {...register("role")}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="admin">Администратор</option>
            <option value="moderator">Модератор</option>
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Загрузка..." : "Добавить пользователя"}
        </Button>
      </form>
    </div>
  );
}
