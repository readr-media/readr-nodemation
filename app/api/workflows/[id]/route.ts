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

    return Response.json(
      { error: "Failed to delete workflow" },
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
