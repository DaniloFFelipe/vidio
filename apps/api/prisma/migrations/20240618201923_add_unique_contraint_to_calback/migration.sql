/*
  Warnings:

  - A unique constraint covering the columns `[type,organization_id]` on the table `callbacks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "callbacks_type_organization_id_key" ON "callbacks"("type", "organization_id");
