'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button } from '@/components/common';
import { salesService } from '@/services/api';
import { Bill } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBills();
  }, [page]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await salesService.getBills(page, 20);
      const { items, totalPages: pages } = response.data.data;
      setBills(items);
      setTotalPages(pages);
    } catch (error) {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="staff">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-dark">Bills</h1>
          <Button variant="primary" onClick={() => window.location.href = '/sales/new-bill'}>
            New Bill
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              <p>No bills found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Bill Number</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Discount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-gray-200 hover:bg-light">
                        <td className="px-6 py-4 font-medium text-dark">{bill.billNumber}</td>
                        <td className="px-6 py-4 font-semibold text-dark">
                          {formatCurrency(bill.finalAmount)}
                        </td>
                        <td className="px-6 py-4 text-secondary">
                          {formatCurrency(bill.totalDiscount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary bg-opacity-20 text-primary">
                            {bill.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              bill.status === 'COMPLETED'
                                ? 'bg-success bg-opacity-20 text-success'
                                : 'bg-warning bg-opacity-20 text-warning'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary text-sm">
                          {formatDate(bill.createdAt)}
                        </td>
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
