-- AlterTable
ALTER TABLE "offers" ADD COLUMN "affiliate_provider" TEXT DEFAULT 'CUELINKS',
ADD COLUMN "conversion_status" TEXT NOT NULL DEFAULT 'NOT_CONVERTED',
ADD COLUMN "is_affiliated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "last_converted_at" TIMESTAMP(3),
ADD COLUMN "conversion_error" TEXT;

-- CreateIndex
CREATE INDEX "offers_conversion_status_idx" ON "offers"("conversion_status");

-- CreateIndex
CREATE INDEX "offers_is_affiliated_idx" ON "offers"("is_affiliated");
