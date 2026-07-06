-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "Workflow_user_id_deleted_at_idx" ON "Workflow"("user_id", "deleted_at");
