import { prisma } from "@/lib/prisma";
import {
  buildWorkflowUpdateData,
  type PatchWorkflowSchema,
  type PutWorkflowSchema,
} from "@/lib/workflow-api-payload";

type WorkflowUpdateSchema =
  | typeof PutWorkflowSchema
  | typeof PatchWorkflowSchema;

export async function handleWorkflowUpdate(
  request: Request,
  params: Promise<{ id: string }>,
  schema: WorkflowUpdateSchema,
  mode: "put" | "patch",
  userId: string,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const updatedResult = await prisma.workflow.updateMany({
      where: { id, user_id: userId },
      data: buildWorkflowUpdateData(parsed.data, mode),
    });

    if (updatedResult.count === 0) {
      return Response.json({ error: "Workflow not found" }, { status: 404 });
    }

    return Response.json({ count: updatedResult.count });
  } catch (error) {
    return Response.json(
      { error: "Failed to update workflow" },
      { status: 500 },
    );
  }
}
