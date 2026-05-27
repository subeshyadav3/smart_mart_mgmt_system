'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button } from '@/components/common';
import { productService } from '@/services/api';
import { InventoryLog } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInventoryLogs();
  }, [page]);

  const fetchInventoryLogs = async () => {
    setLoading(true);
    try {
      const response = await productService.getInventoryLogs(page, 20);
      const { items, totalPages: pages } = response.data.data;
      setLogs(items);
      setTotalPages(pages);
    } catch (error) {
      toast.error('Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="staff">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-dark">Inventory Logs</h1>

        <Card title="Stock Change History">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              <p>No inventory logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Product ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Previous Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">New Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Change</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Reason</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-200 hover:bg-light">
                        <td className="px-6 py-4 font-medium text-dark">{log.productId.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-secondary">{log.previousStock}</td>
                        <td className="px-6 py-4 text-secondary">{log.newStock}</td>
                        <td className="px-6 py-4 font-semibold">
                          <span
                            className={log.changeAmount > 0 ? 'text-success' : 'text-danger'}
                          >
                            {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-dark">{log.reason}</td>
                        <td className="px-6 py-4 text-secondary text-sm">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-dark font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </ProtectedLayout>
  );
}
