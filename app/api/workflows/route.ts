import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// TODO: use the TS we define.
const JsonFieldSchema = z.union([
  z.string(),
  z.array(z.unknown()),
  z.record(z.unknown()),
]);

const CreateWorkflowSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  description: z.string().optional(),
  nodes: JsonFieldSchema,
  edges: JsonFieldSchema,
  status: z.string().trim().min(1),
  cron_expression: z.string().optional(),
  next_run_at: z.string().datetime().optional(),
  last_run_at: z.string().datetime().optional(),
});

function toJsonString(value: z.infer<typeof JsonFieldSchema>): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

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
        id: data.id ?? crypto.randomUUID(),
        name: data.name,
        description: data.description,
        nodes: toJsonString(data.nodes),
        edges: toJsonString(data.edges),
        status: data.status,
        cron_expression: data.cron_expression,
        next_run_at: data.next_run_at ? new Date(data.next_run_at) : null,
        last_run_at: data.last_run_at ? new Date(data.last_run_at) : null,
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
