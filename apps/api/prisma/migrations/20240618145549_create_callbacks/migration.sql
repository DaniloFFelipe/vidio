-- CreateEnum
CREATE TYPE "CallbacksType" AS ENUM ('VIDEO_CREATED', 'VIDEO_DELETED');

-- CreateTable
CREATE TABLE "callbacks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "CallbacksType" NOT NULL,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "callbacks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "callbacks" ADD CONSTRAINT "callbacks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
