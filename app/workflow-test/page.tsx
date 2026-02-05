"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  nodes: string;
  edges: string;
  status: string;
  cron_expression: string | null;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

const defaultNodes = "[]";
const defaultEdges = "[]";

export default function WorkflowTestPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [nodes, setNodes] = useState(defaultNodes);
  const [edges, setEdges] = useState(defaultEdges);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWorkflows = async () => {
    setError(null);
    try {
      const res = await fetch("/api/workflows", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch workflows");
      }
      const data = (await res.json()) as Workflow[];
      setWorkflows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    void loadWorkflows();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          status,
          nodes: nodes || defaultNodes,
          edges: edges || defaultEdges,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to create workflow");
      }

      setName("");
      setDescription("");
      setStatus("pending");
      setNodes(defaultNodes);
      setEdges(defaultEdges);
      await loadWorkflows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="title-3 text-gray-900">Workflow SQLite Test</h1>
        <p className="body-2 text-gray-600">
          Minimal UI for creating and listing workflows stored in SQLite via
          Prisma.
        </p>
      </div>

      <form
        className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example workflow"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            placeholder="pending | active | disabled"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nodes">Nodes (JSON)</Label>
          <Textarea
            id="nodes"
            value={nodes}
            onChange={(event) => setNodes(event.target.value)}
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edges">Edges (JSON)</Label>
          <Textarea
            id="edges"
            value={edges}
            onChange={(event) => setEdges(event.target.value)}
            rows={4}
          />
        </div>

        {error ? <p className="body-2 text-red-600">{error}</p> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create workflow"}
        </Button>
      </form>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="title-5 text-gray-900">Stored Workflows</h2>
          <Button variant="outline" type="button" onClick={() => loadWorkflows()}>
            Refresh
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {workflows.length === 0 ? (
            <p className="body-2 text-gray-500">No workflows yet.</p>
          ) : (
            workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="title-6 text-gray-900">{workflow.name}</h3>
                  <span className="body-3 text-gray-500">{workflow.status}</span>
                </div>
                {workflow.description ? (
                  <p className="body-3 text-gray-600">{workflow.description}</p>
                ) : null}
                <p className="body-3 text-gray-400">ID: {workflow.id}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
