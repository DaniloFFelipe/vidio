/*
  Warnings:

  - Added the required column `name` to the `application_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "application_keys" ADD COLUMN     "name" TEXT NOT NULL;
