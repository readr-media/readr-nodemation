import { Prisma } from "@prisma/client";
import { getActiveUserId } from "@/lib/active-user";
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
    const activeUserId = await getActiveUserId();
    if (!activeUserId) {
      return Response.json(
        { error: "Active user is required" },
        { status: 401 },
      );
    }

    // Soft delete: stamp deleted_at instead of removing the row. This hides the
    // workflow from every listing and the scheduler (all reads filter
    // deleted_at IS NULL) while preserving its Job/JobLog execution history so
    // past run logs stay queryable. The deleted_at: null guard makes a repeat
    // delete a no-op that reports 404.
    const deletedResult = await prisma.workflow.updateMany({
      where: {
        id,
        user_id: activeUserId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
        // Unschedule it too, so the worker's (status, next_run_at) poll index
        // never even scans a deleted workflow (the deleted_at IS NULL filter is
        // still there as the authoritative guard).
        next_run_at: null,
      },
    });
    if (deletedResult.count === 0) {
      return Response.json({ error: "Workflow not found" }, { status: 404 });
    }
    return Response.json({ id });
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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const activeUserId = await getActiveUserId();
    if (!activeUserId) {
      return Response.json(
        { error: "Active user is required" },
        { status: 401 },
      );
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        user_id: activeUserId,
        deleted_at: null,
      },
    });

    if (!workflow) {
      return Response.json({ error: "Workflow not found" }, { status: 404 });
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
  const activeUserId = await getActiveUserId();
  if (!activeUserId) {
    return Response.json({ error: "Active user is required" }, { status: 401 });
  }
  return handleWorkflowUpdate(
    request,
    params,
    PutWorkflowSchema,
    "put",
    activeUserId,
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const activeUserId = await getActiveUserId();
  if (!activeUserId) {
    return Response.json({ error: "Active user is required" }, { status: 401 });
  }
  return handleWorkflowUpdate(
    request,
    params,
    PatchWorkflowSchema,
    "patch",
    activeUserId,
  );
}
