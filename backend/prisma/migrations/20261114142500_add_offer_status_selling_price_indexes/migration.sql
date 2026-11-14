-- CreateIndex
CREATE INDEX IF NOT EXISTS "offers_status_sellingPrice_idx" ON "offers"("status", "sellingPrice");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "offers_productId_status_sellingPrice_idx" ON "offers"("productId", "status", "sellingPrice");

