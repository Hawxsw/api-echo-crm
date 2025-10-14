-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isHead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER;
