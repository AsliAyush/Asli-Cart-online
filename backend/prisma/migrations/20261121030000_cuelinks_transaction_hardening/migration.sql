-- AlterTable
ALTER TABLE "cuelinks_transactions" ALTER COLUMN "currency" SET DEFAULT 'UNKNOWN';

-- AlterTable
ALTER TABLE "cuelinks_transaction_sync_logs"
ADD COLUMN "is_partial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "checkpoint_page" INTEGER,
ADD COLUMN "reached_page_limit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "last_processed_date" TIMESTAMP(3);
