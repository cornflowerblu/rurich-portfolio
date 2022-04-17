/*
  Warnings:

  - A unique constraint covering the columns `[authorId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "authorId" TEXT;
ALTER TABLE "User" ADD COLUMN "authorName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_authorId_key" ON "User"("authorId");
