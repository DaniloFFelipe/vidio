/*
  Warnings:

  - You are about to drop the column `location` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `raw_location` on the `videos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "videos" DROP COLUMN "location",
DROP COLUMN "raw_location";
