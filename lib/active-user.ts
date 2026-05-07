import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ACTIVE_USER_COOKIE_KEY = "active_user_id";

export type ActiveUserOption = {
  id: string;
  name: string;
  role: string;
  email: string;
};

export async function getAllUsers(): Promise<ActiveUserOption[]> {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
    },
  });

  return users;
}

export async function getActiveUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get(ACTIVE_USER_COOKIE_KEY)?.value;
  if (!cookieUserId) {
    return null;
  }

  const users = await getAllUsers();
  if (users.length === 0) {
    return null;
  }

  if (users.some((user) => user.id === cookieUserId)) {
    return cookieUserId;
  }

  return null;
}
