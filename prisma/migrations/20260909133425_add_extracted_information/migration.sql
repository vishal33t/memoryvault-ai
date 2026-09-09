-- CreateTable
CREATE TABLE "ExtractedInformation" (
    "id" TEXT NOT NULL,
    "screenshotId" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "company" TEXT,
    "role" TEXT,
    "deadline" TIMESTAMP(3),
    "location" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ExtractedInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtractedInformation_screenshotId_key" ON "ExtractedInformation"("screenshotId");

-- AddForeignKey
ALTER TABLE "ExtractedInformation" ADD CONSTRAINT "ExtractedInformation_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "Screenshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
