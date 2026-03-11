export async function DELETE(
  _request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  return Response.json({ error: "Workflow not found" }, { status: 404 });
}
