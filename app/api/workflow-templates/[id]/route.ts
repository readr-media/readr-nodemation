import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WORKFLOW_STATUSES, type WorkflowStatus } from "@/lib/workflow-status";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const templateId = Number.parseInt(id, 10);

  if (!Number.isInteger(templateId)) {
    return NextResponse.json({ error: "Invalid template id" }, { status: 400 });
  }

  try {
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        nodes: true,
        edges: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Workflow template not found" },
        { status: 404 },
      );
    }

    const normalizedStatus = WORKFLOW_STATUSES.includes(
      template.status as WorkflowStatus,
    )
      ? (template.status as WorkflowStatus)
      : "template";

    return NextResponse.json({
      ...template,
      status: normalizedStatus,
    });
  } catch (error) {
    console.error("Error fetching workflow template:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow template" },
      { status: 500 },
    );
  }
}
