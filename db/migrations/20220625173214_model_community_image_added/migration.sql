-- CreateTable
CREATE TABLE "CommunityImage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "communityId" INTEGER NOT NULL,

    CONSTRAINT "CommunityImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommunityImage" ADD CONSTRAINT "CommunityImage_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
