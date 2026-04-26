import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildWorkflowCreateData,
  CreateWorkflowSchema,
} from "@/lib/workflow-api-payload";

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
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
