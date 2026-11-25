'use client';

import React, { useState } from 'react';
import { StaffPageHeader } from '@/components/layout/staff';
import {
  useTransactions,
  TransactionsTable,
  TransactionFilters,
  TransactionDetailDialog,
  type CuelinksTransactionItem,
  type TransactionFilterParams,
} from '@/modules/admin/affiliate-analytics';

export default function AdminTransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    limit: 20,
    sort: 'transactionDate',
    order: 'desc',
  });

  const [selectedTx, setSelectedTx] = useState<CuelinksTransactionItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);

  const { data, isLoading } = useTransactions(filters);

  const handleFilterChange = (updated: Partial<TransactionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sort: 'transactionDate',
      order: 'desc',
    });
  };

  const handleView = (tx: CuelinksTransactionItem) => {
    setSelectedTx(tx);
    setDetailDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Affiliate Transactions Ledger"
        description="Inspect monetized orders, sale amounts, commissions, merchant references, and lifecycle statuses."
      />

      <TransactionFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <TransactionsTable
        items={data?.items || []}
        pagination={
          data?.pagination || {
            page: filters.page || 1,
            limit: filters.limit || 20,
            total: (data?.items || []).length,
            totalPages: 1,
          }
        }
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onView={handleView}
      />

      <TransactionDetailDialog
        transaction={selectedTx}
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />
    </div>
  );
}
