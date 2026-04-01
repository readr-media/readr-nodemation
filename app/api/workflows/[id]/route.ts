import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  PatchWorkflowSchema,
  PutWorkflowSchema,
} from "@/lib/workflow-api-payload";
import { handleWorkflowUpdate } from "@/lib/workflow-route-update";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const workflow = await prisma.workflow.delete({
      where: { id },
    });

    return Response.json({ id: workflow.id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Workflow not found" }, { status: 404 });
    }
  }

  return Response.json({ error: "Failed to delete workflow" }, { status: 500 });
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      return Response.json(
        { error: "Workflow not found" },
        { status: 404 },
      );
    }

    return Response.json(workflow);
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return Response.json(
      { error: "Failed to fetch workflow" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleWorkflowUpdate(request, params, PutWorkflowSchema, "put");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleWorkflowUpdate(request, params, PatchWorkflowSchema, "patch");
}
