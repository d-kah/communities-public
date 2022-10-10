/*
  Warnings:

  - You are about to drop the column `name` on the `CommunityImage` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `CommunityImage` table. All the data in the column will be lost.
  - Added the required column `key` to the `CommunityImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommunityImage" DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "key" TEXT NOT NULL,
ALTER COLUMN "url" DROP NOT NULL;
