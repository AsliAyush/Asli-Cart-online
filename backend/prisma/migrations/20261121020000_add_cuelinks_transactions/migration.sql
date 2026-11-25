-- CreateTable
CREATE TABLE "cuelinks_transactions" (
    "id" TEXT NOT NULL,
    "external_transaction_id" TEXT NOT NULL,
    "campaign_id" INTEGER,
    "campaign_name" TEXT,
    "campaign_type" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sale_amount" DECIMAL(14,2),
    "commission_amount" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "merchant_ref_id" TEXT,
    "order_id" TEXT,
    "product_name" TEXT,
    "category" TEXT,
    "channel_id" INTEGER,
    "channel_name" TEXT,
    "sub_id" TEXT,
    "sub_id_2" TEXT,
    "sub_id_3" TEXT,
    "sub_id_4" TEXT,
    "sub_id_5" TEXT,
    "invoice_number" TEXT,
    "raw_metadata" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuelinks_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuelinks_transaction_sync_logs" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_since" TIMESTAMP(3),
    "records_fetched" INTEGER NOT NULL DEFAULT 0,
    "records_created" INTEGER NOT NULL DEFAULT 0,
    "records_updated" INTEGER NOT NULL DEFAULT 0,
    "failed_records" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuelinks_transaction_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuelinks_transactions_external_transaction_id_key" ON "cuelinks_transactions"("external_transaction_id");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_external_transaction_id_idx" ON "cuelinks_transactions"("external_transaction_id");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_transaction_date_idx" ON "cuelinks_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_status_idx" ON "cuelinks_transactions"("status");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_campaign_id_idx" ON "cuelinks_transactions"("campaign_id");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_sub_id_idx" ON "cuelinks_transactions"("sub_id");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_invoice_number_idx" ON "cuelinks_transactions"("invoice_number");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_updated_at_idx" ON "cuelinks_transactions"("updated_at");

-- CreateIndex
CREATE INDEX "cuelinks_transactions_last_synced_at_idx" ON "cuelinks_transactions"("last_synced_at");

-- CreateIndex
CREATE INDEX "cuelinks_transaction_sync_logs_started_at_idx" ON "cuelinks_transaction_sync_logs"("started_at");

-- CreateIndex
CREATE INDEX "cuelinks_transaction_sync_logs_status_idx" ON "cuelinks_transaction_sync_logs"("status");
