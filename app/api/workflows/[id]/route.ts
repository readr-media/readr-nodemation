import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
