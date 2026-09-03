/*
  Warnings:

  - You are about to drop the column `roomName` on the `LiveClass` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LiveClass" DROP CONSTRAINT "LiveClass_courseId_fkey";

-- DropIndex
DROP INDEX "LiveClass_roomName_key";

-- AlterTable
ALTER TABLE "LiveClass" DROP COLUMN "roomName",
ADD COLUMN     "meetLink" TEXT,
ADD COLUMN     "subjectId" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
