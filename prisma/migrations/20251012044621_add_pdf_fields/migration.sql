/*
  Warnings:

  - You are about to drop the column `blockId` on the `Note` table. All the data in the column will be lost.
  - Made the column `blockId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Message_canvasId_createdAt_id_idx";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "blockId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "blockId";

-- CreateTable
CREATE TABLE "PDF" (
    "id" TEXT NOT NULL,
    "canvasId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extractedText" TEXT NOT NULL,

    CONSTRAINT "PDF_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PDF_canvasId_blockId_idx" ON "PDF"("canvasId", "blockId");

-- CreateIndex
CREATE INDEX "Message_canvasId_blockId_createdAt_idx" ON "Message"("canvasId", "blockId", "createdAt");

-- AddForeignKey
ALTER TABLE "PDF" ADD CONSTRAINT "PDF_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
