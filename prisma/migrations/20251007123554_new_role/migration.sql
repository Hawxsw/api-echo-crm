/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE');

-- CreateEnum
CREATE TYPE "PermissionResource" AS ENUM ('USERS', 'DEPARTMENTS', 'ROLES', 'KANBAN_BOARDS', 'KANBAN_CARDS', 'CHAT', 'WHATSAPP', 'COMPANY_SETTINGS', 'REPORTS', 'ALL');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT;

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "resource" "PermissionResource" NOT NULL,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roles_companyId_idx" ON "roles"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_companyId_name_key" ON "roles"("companyId", "name");

-- CreateIndex
CREATE INDEX "permissions_roleId_idx" ON "permissions"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_roleId_action_resource_key" ON "permissions"("roleId", "action", "resource");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
