/*
  Warnings:

  - You are about to drop the column `key` on the `CommunityImage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `CommunityImage` table. All the data in the column will be lost.
  - Added the required column `cloudId` to the `CommunityImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cloudUrl` to the `CommunityImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommunityImage" DROP COLUMN "key",
DROP COLUMN "url",
ADD COLUMN     "cloudId" TEXT NOT NULL,
ADD COLUMN     "cloudUrl" TEXT NOT NULL;
