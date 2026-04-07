import { z } from "zod";
import { WORKFLOW_STATUS_VALUES } from "@/lib/workflow-status";

export const JsonFieldSchema = z.union([
  z.string(),
  z.array(z.unknown()),
  z.record(z.unknown()),
]);

export const CreateWorkflowSchema = z
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

export const PutWorkflowSchema = CreateWorkflowSchema;

export const PatchWorkflowSchema = PutWorkflowSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required",
  },
);

export function toJsonString(value: z.infer<typeof JsonFieldSchema>): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function buildWorkflowCreateData(
  data: z.infer<typeof CreateWorkflowSchema>,
) {
  return {
    name: data.name,
    description: data.description,
    nodes: toJsonString(data.nodes),
    edges: toJsonString(data.edges),
    status: data.status,
    cron_expression: data.cron_expression,
    next_run_at: data.next_run_at ? new Date(data.next_run_at) : null,
    last_run_at: data.last_run_at ? new Date(data.last_run_at) : null,
  };
}

export function buildWorkflowUpdateData(
  data: z.infer<typeof PutWorkflowSchema> | z.infer<typeof PatchWorkflowSchema>,
  mode: "put" | "patch",
) {
  if (mode === "put") {
    const putData = data as z.infer<typeof PutWorkflowSchema>;

    return {
      name: putData.name,
      description: putData.description ?? null,
      nodes: toJsonString(putData.nodes),
      edges: toJsonString(putData.edges),
      status: putData.status,
      cron_expression: putData.cron_expression ?? null,
      ...(putData.next_run_at !== undefined && {
        next_run_at: new Date(putData.next_run_at),
      }),
      ...(putData.last_run_at !== undefined && {
        last_run_at: new Date(putData.last_run_at),
      }),
    };
  }

  const patchData = data as z.infer<typeof PatchWorkflowSchema>;
  const updateData: Record<string, unknown> = {};

  if (patchData.name !== undefined) {
    updateData.name = patchData.name;
  }

  if (patchData.description !== undefined) {
    updateData.description = patchData.description;
  }

  if (patchData.nodes !== undefined) {
    updateData.nodes = toJsonString(patchData.nodes);
  }

  if (patchData.edges !== undefined) {
    updateData.edges = toJsonString(patchData.edges);
  }

  if (patchData.status !== undefined) {
    updateData.status = patchData.status;
  }

  if (patchData.cron_expression !== undefined) {
    updateData.cron_expression = patchData.cron_expression;
  }

  if (patchData.next_run_at !== undefined) {
    updateData.next_run_at = new Date(patchData.next_run_at);
  }

  if (patchData.last_run_at !== undefined) {
    updateData.last_run_at = new Date(patchData.last_run_at);
  }

  return updateData;
}
