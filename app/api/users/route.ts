import { NextResponse } from "next/server";
import { getActiveUserId, getAllUsers } from "@/lib/active-user";

export async function GET() {
  try {
    const [users, activeUserId] = await Promise.all([
      getAllUsers(),
      getActiveUserId(),
    ]);

    return NextResponse.json({
      users,
      activeUserId,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
