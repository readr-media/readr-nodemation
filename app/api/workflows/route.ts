import { NextResponse } from "next/server";
import { getActiveUserId } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import {
  buildWorkflowCreateData,
  CreateWorkflowSchema,
} from "@/lib/workflow-api-payload";

export async function GET() {
  try {
    const activeUserId = await getActiveUserId();
    if (!activeUserId) {
      return NextResponse.json([]);
    }

    const workflows = await prisma.workflow.findMany({
      where: { user_id: activeUserId },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const activeUserId = await getActiveUserId();
    if (!activeUserId) {
      return NextResponse.json(
        { error: "尚未選擇帳號，無法建立工作流" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = CreateWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const workflow = await prisma.workflow.create({
      data: {
        id: crypto.randomUUID(),
        ...buildWorkflowCreateData(data),
        user_id: activeUserId,
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 },
    );
  }
}
