/*
  Warnings:

  - Made the column `url` on table `CommunityImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CommunityImage" ALTER COLUMN "url" SET NOT NULL;
