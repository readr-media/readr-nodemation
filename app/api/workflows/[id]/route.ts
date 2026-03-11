import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { WORKFLOW_STATUS_VALUES } from "@/lib/workflow-status";

const JsonFieldSchema = z.union([
  z.string(),
  z.array(z.unknown()),
  z.record(z.unknown()),
]);

const PutWorkflowSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().optional(),
    nodes: JsonFieldSchema,
    edges: JsonFieldSchema,
    status: z.enum(WORKFLOW_STATUS_VALUES),
    cron_expression: z.string().optional(),
    next_run_at: z.string().datetime().optional(),
    last_run_at: z.string().datetime().optional(),
  })
  .strict();

function toJsonString(value: z.infer<typeof JsonFieldSchema>): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

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

    return Response.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const parsed = PutWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const data = parsed.data;

  try {
    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        nodes: toJsonString(data.nodes),
        edges: toJsonString(data.edges),
        status: data.status,
        cron_expression: data.cron_expression,
        next_run_at: data.next_run_at ? new Date(data.next_run_at) : undefined,
        last_run_at: data.last_run_at ? new Date(data.last_run_at) : undefined,
      },
    });

    return Response.json(workflow);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Workflow not found" }, { status: 404 });
    }

    return Response.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}
