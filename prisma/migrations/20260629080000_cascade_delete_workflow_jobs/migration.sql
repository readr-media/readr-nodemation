-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "JobLog" DROP CONSTRAINT "JobLog_job_id_fkey";

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLog" ADD CONSTRAINT "JobLog_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
