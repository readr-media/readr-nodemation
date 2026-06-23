import { NextResponse } from "next/server";
import { getActiveUserId } from "@/lib/active-user";
import { getUserJobs } from "@/lib/jobs";

const DEFAULT_PAGE_SIZE = 15;

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
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(
      searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    );

    const result = await getUserJobs(activeUserId, {
      timeRange,
      status,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
