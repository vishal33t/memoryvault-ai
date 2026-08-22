/*
  Warnings:

  - Added the required column `fileName` to the `Screenshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Screenshot" DROP CONSTRAINT "Screenshot_userId_fkey";

-- AlterTable
ALTER TABLE "Screenshot" ADD COLUMN     "category" TEXT,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'uploaded';

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
