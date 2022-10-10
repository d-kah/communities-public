/*
  Warnings:

  - Added the required column `dropzoneId` to the `CommunityImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommunityImage" ADD COLUMN     "dropzoneId" TEXT NOT NULL;
