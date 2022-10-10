-- CreateTable
CREATE TABLE "CommunityImageCover" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "communityId" INTEGER NOT NULL,

    CONSTRAINT "CommunityImageCover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityImageCover_communityId_key" ON "CommunityImageCover"("communityId");

-- AddForeignKey
ALTER TABLE "CommunityImageCover" ADD CONSTRAINT "CommunityImageCover_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
