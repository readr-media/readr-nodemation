import { NextResponse } from "next/server";
import { z } from "zod";
import { ACTIVE_USER_COOKIE_KEY, getAllUsers } from "@/lib/active-user";

const SetActiveUserSchema = z
  .object({
    userId: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = SetActiveUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const users = await getAllUsers();
    const nextUser = users.find((user) => user.id === parsed.data.userId);

    if (!nextUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json({
      user: nextUser,
      activeUserId: nextUser.id,
    });

    response.cookies.set({
      name: ACTIVE_USER_COOKIE_KEY,
      value: nextUser.id,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Error switching active user:", error);
    return NextResponse.json(
      { error: "Failed to switch active user" },
      { status: 500 },
    );
  }
}
