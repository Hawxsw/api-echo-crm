-- CreateEnum
CREATE TYPE "SalesOpportunityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SalesActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE');

-- CreateEnum
CREATE TYPE "SalesActivityStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "PermissionResource_new" AS ENUM ('USERS', 'ROLES', 'KANBAN_BOARDS', 'KANBAN_CARDS', 'CHAT', 'WHATSAPP', 'REPORTS', 'SALES_PIPELINE', 'SALES_OPPORTUNITIES', 'ALL');
ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "PermissionResource_new" USING ("resource"::text::"PermissionResource_new");
ALTER TYPE "PermissionResource" RENAME TO "PermissionResource_old";
ALTER TYPE "PermissionResource_new" RENAME TO "PermissionResource";
DROP TYPE "public"."PermissionResource_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isHead";

-- CreateTable
CREATE TABLE "sales_pipelines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_stages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "pipelineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "company" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "value" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stageId" TEXT NOT NULL,
    "priority" "SalesOpportunityPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_activities" (
    "id" TEXT NOT NULL,
    "type" "SalesActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3),
    "completedTime" TEXT,
    "status" "SalesActivityStatus" NOT NULL DEFAULT 'SCHEDULED',
    "opportunityId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sales_stages_pipelineId_idx" ON "sales_stages"("pipelineId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_stages_pipelineId_position_key" ON "sales_stages"("pipelineId", "position");

-- CreateIndex
CREATE INDEX "sales_opportunities_stageId_idx" ON "sales_opportunities"("stageId");

-- CreateIndex
CREATE INDEX "sales_opportunities_createdById_idx" ON "sales_opportunities"("createdById");

-- CreateIndex
CREATE INDEX "sales_opportunities_assignedToId_idx" ON "sales_opportunities"("assignedToId");

-- CreateIndex
CREATE INDEX "sales_comments_opportunityId_idx" ON "sales_comments"("opportunityId");

-- CreateIndex
CREATE INDEX "sales_comments_userId_idx" ON "sales_comments"("userId");

-- CreateIndex
CREATE INDEX "sales_activities_opportunityId_idx" ON "sales_activities"("opportunityId");

-- CreateIndex
CREATE INDEX "sales_activities_assignedToId_idx" ON "sales_activities"("assignedToId");

-- AddForeignKey
ALTER TABLE "sales_stages" ADD CONSTRAINT "sales_stages_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "sales_pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_opportunities" ADD CONSTRAINT "sales_opportunities_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "sales_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_opportunities" ADD CONSTRAINT "sales_opportunities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_opportunities" ADD CONSTRAINT "sales_opportunities_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_comments" ADD CONSTRAINT "sales_comments_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "sales_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_comments" ADD CONSTRAINT "sales_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "sales_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
