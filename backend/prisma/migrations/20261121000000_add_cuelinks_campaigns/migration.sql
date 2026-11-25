-- CreateTable
CREATE TABLE "cuelinks_campaigns" (
    "id" TEXT NOT NULL,
    "external_campaign_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "domain" TEXT,
    "image" TEXT,
    "access_status" TEXT NOT NULL DEFAULT 'open',
    "payout" TEXT,
    "payout_currency" TEXT DEFAULT 'INR',
    "epc_7d" TEXT,
    "epc_90d" TEXT,
    "campaign_type" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "category" TEXT,
    "platforms" JSONB,
    "media" JSONB,
    "raw_metadata" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuelinks_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuelinks_campaigns_external_campaign_id_key" ON "cuelinks_campaigns"("external_campaign_id");

-- CreateIndex
CREATE INDEX "cuelinks_campaigns_external_campaign_id_idx" ON "cuelinks_campaigns"("external_campaign_id");

-- CreateIndex
CREATE INDEX "cuelinks_campaigns_access_status_idx" ON "cuelinks_campaigns"("access_status");

-- CreateIndex
CREATE INDEX "cuelinks_campaigns_name_idx" ON "cuelinks_campaigns"("name");

-- CreateIndex
CREATE INDEX "cuelinks_campaigns_domain_idx" ON "cuelinks_campaigns"("domain");

-- CreateIndex
CREATE INDEX "cuelinks_campaigns_category_idx" ON "cuelinks_campaigns"("category");

-- CreateIndex
CREATE INDEX "cuelinks_campaigns_country_idx" ON "cuelinks_campaigns"("country");

-- CreateIndex
CREATE INDEX "cuelinks_campaigns_last_synced_at_idx" ON "cuelinks_campaigns"("last_synced_at");
