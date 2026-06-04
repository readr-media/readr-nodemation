-- AlterTable
ALTER TABLE "WorkflowTemplate"
ADD COLUMN "nodes" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "WorkflowTemplate"
ADD COLUMN "edges" TEXT NOT NULL DEFAULT '[]';
