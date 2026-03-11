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

const PatchWorkflowSchema = PutWorkflowSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required",
  },
);

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
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

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
        description: data.description ?? null,
        nodes: toJsonString(data.nodes),
        edges: toJsonString(data.edges),
        status: data.status,
        cron_expression: data.cron_expression ?? null,
        next_run_at: data.next_run_at ? new Date(data.next_run_at) : null,
        last_run_at: data.last_run_at ? new Date(data.last_run_at) : null,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = PatchWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.nodes !== undefined) {
    updateData.nodes = toJsonString(data.nodes);
  }

  if (data.edges !== undefined) {
    updateData.edges = toJsonString(data.edges);
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.cron_expression !== undefined) {
    updateData.cron_expression = data.cron_expression;
  }

  if (data.next_run_at !== undefined) {
    updateData.next_run_at = new Date(data.next_run_at);
  }

  if (data.last_run_at !== undefined) {
    updateData.last_run_at = new Date(data.last_run_at);
  }

  try {
    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
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
