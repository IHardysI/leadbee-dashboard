// src/lib/authUtils.ts
import { authClient } from "./client";
import prisma from "@/components/shared/lib/prisma";

/**
 * Атрыманне сесіі праз authClient.getSession.
 * Функцыя вяртае аб'ект са структурай { data: { user: { id: string, ... } } }.
 */
type SessionResponse = 
  | { data: { user: { id: string; email: string; emailVerified: boolean; name: string; createdAt: Date; updatedAt: Date; image?: string | null }; session: any } }
  | { error: any };

export async function getSession(): Promise<{ user: { id: string } } | null> {
  try {
    const result = (await authClient.getSession()) as SessionResponse;
    if ("data" in result && result.data && result.data.user && result.data.user.id) {
      return { user: { id: result.data.user.id } };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error("Error retrieving current user id:", error);
    return null;
  }
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === "admin";
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
}
