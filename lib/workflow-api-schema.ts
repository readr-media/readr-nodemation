import { z } from "zod";
import { WORKFLOW_STATUS_VALUES } from "@/lib/workflow-status";

export const JsonFieldSchema = z.union([
  z.string(),
  z.array(z.unknown()),
  z.record(z.unknown()),
]);

export const WorkflowPayloadSchema = z
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

export type WorkflowPayload = z.infer<typeof WorkflowPayloadSchema>;

export function toJsonString(value: z.infer<typeof JsonFieldSchema>): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}
