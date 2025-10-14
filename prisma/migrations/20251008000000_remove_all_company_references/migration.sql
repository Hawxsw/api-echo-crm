-- Remove foreign key constraints first
ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_companyId_fkey";
ALTER TABLE "departments" DROP CONSTRAINT IF EXISTS "departments_companyId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_companyId_fkey";
ALTER TABLE "kanban_boards" DROP CONSTRAINT IF EXISTS "kanban_boards_companyId_fkey";

-- Drop indexes related to companyId
DROP INDEX IF EXISTS "roles_companyId_idx";
DROP INDEX IF EXISTS "roles_companyId_name_key";
DROP INDEX IF EXISTS "departments_companyId_idx";
DROP INDEX IF EXISTS "users_companyId_idx";
DROP INDEX IF EXISTS "kanban_boards_companyId_idx";

-- Remove companyId columns from tables
ALTER TABLE "roles" DROP COLUMN IF EXISTS "companyId";
ALTER TABLE "departments" DROP COLUMN IF EXISTS "companyId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "companyId";
ALTER TABLE "kanban_boards" DROP COLUMN IF EXISTS "companyId";

-- Add unique constraint on roles.name (since it was companyId + name before)
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_key" UNIQUE ("name");

-- Add missing columns to users table that are in the current schema but not in DB
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDepartmentHead" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "managedDepartmentId" TEXT;

-- Add foreign key for managedDepartmentId
ALTER TABLE "users" ADD CONSTRAINT "users_managedDepartmentId_fkey" 
  FOREIGN KEY ("managedDepartmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for managedDepartmentId
CREATE INDEX IF NOT EXISTS "users_managedDepartmentId_idx" ON "users"("managedDepartmentId");

-- Drop companies table (should be last to avoid constraint issues)
DROP TABLE IF EXISTS "companies" CASCADE;

