import { ACTIVE_USER_COOKIE_KEY } from "@/lib/active-user";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: ACTIVE_USER_COOKIE_KEY,
      value: "",
      path: "/",
      sameSite: "lax",
      maxAge: 0,
    });

    return NextResponse.json({ message: "Logged out" }, { status: 200 });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
