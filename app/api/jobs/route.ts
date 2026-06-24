import { NextResponse } from "next/server";
import { getActiveUserId } from "@/lib/active-user";
import { getUserJobs } from "@/lib/jobs";

const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 100;

export async function GET(request: Request) {
  try {
    const activeUserId = await getActiveUserId();
    if (!activeUserId) {
      return NextResponse.json({
        items: [],
        total: 0,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") ?? "all";
    const status = searchParams.get("status") ?? "all";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(
      searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
      10,
    );

    const result = await getUserJobs(activeUserId, {
      timeRange,
      status,
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize:
        Number.isInteger(pageSize) && pageSize > 0
          ? Math.min(pageSize, MAX_PAGE_SIZE)
          : DEFAULT_PAGE_SIZE,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
