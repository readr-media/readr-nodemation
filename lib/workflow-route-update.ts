import { Prisma } from "@prisma/client";
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
    const workflow = await prisma.workflow.update({
      where: { id },
      data: buildWorkflowUpdateData(parsed.data, mode),
    });

    return Response.json(workflow);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Workflow not found" }, { status: 404 });
    }

    return Response.json(
      { error: "Failed to update workflow" },
      { status: 500 },
    );
  }
}
