-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" TEXT NOT NULL,
    "edges" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cron_expression" TEXT,
    "next_run_at" DATETIME,
    "last_run_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflow_id" TEXT NOT NULL,
    "workflow_snapshot" TEXT,
    "status" TEXT NOT NULL,
    "result" TEXT,
    "error" TEXT,
    "node_results" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    CONSTRAINT "Job_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "job_id" TEXT NOT NULL,
    "node_id" TEXT,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "JobLog_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
