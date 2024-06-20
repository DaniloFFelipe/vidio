-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PROCESSING', 'DONE', 'FAILLURE');

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "status" "FileStatus" NOT NULL DEFAULT 'PROCESSING';
