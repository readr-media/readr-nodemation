import { describe, expect, it } from "vitest";
import { DELETE } from "@/app/api/workflows/[id]/route";

describe("workflow resource route", () => {
  it("returns 404 when deleting a workflow that does not exist", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/workflows/missing", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Workflow not found",
    });
  });
});
