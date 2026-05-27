'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button, Modal } from '@/components/common';
import { productService, salesService } from '@/services/api';
import { Product, Bill, CartItem } from '@/types';
import { useCart } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewBillPage() {
  const { items, total, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ONLINE'>('CASH');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts(1, 100);
      setProducts(response.data.data.items);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const billData = {
        memberId: memberId || null,
        subtotal: total,
        totalDiscount: items.reduce(
          (sum, item) => sum + item.sellingPrice * item.quantity * (item.discountPercent / 100),
          0
        ),
        finalAmount: total,
        paymentMethod,
        billItems: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          productPrice: item.sellingPrice,
          discount: item.sellingPrice * item.quantity * (item.discountPercent / 100),
        })),
      };

      await salesService.createBill(billData);
      toast.success('Bill created successfully');
      clearCart();
      setModalOpen(false);
      setMemberId('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create bill';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout requiredRole="staff">
        <div className="text-center">Loading products...</div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout requiredRole="staff">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-dark">New Bill</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <Card title="Products">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-dark mb-2">{product.name}</h3>
                    <p className="text-sm text-secondary mb-1">SKU: {product.sku}</p>
                    <p className="text-lg font-bold text-primary mb-3">
                      {formatCurrency(product.sellingPrice)}
                    </p>
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          product.stockQuantity > 0
                            ? 'bg-success bg-opacity-20 text-success'
                            : 'bg-danger bg-opacity-20 text-danger'
                        }`}
                      >
                        Stock: {product.stockQuantity}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={product.stockQuantity === 0}
                        onClick={() => addItem(product, 1)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cart Summary */}
          <div>
            <Card title="Cart Summary" className="sticky top-20">
              {items.length === 0 ? (
                <p className="text-center text-secondary py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="border-b border-gray-200 pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-dark text-sm">{item.name}</p>
                            <p className="text-xs text-secondary">
                              {formatCurrency(item.sellingPrice)} x {item.quantity}
                            </p>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value))
                            }
                            className="w-12 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="font-semibold text-dark text-sm">
                            {formatCurrency(
                              item.sellingPrice *
                                item.quantity *
                                (1 - item.discountPercent / 100)
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-secondary">
                      <span>Subtotal</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-dark text-lg bg-light p-3 rounded">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Button
                    variant="success"
                    className="w-full mt-4"
                    onClick={() => setModalOpen(true)}
                  >
                    <CheckCircle size={20} className="mr-2" />
                    Checkout
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Complete Purchase"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Member ID (Optional)</label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Leave empty for non-members"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'CARD' | 'ONLINE')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          <div className="bg-light p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-secondary">Total Amount</span>
              <span className="font-bold text-dark">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="success"
              className="flex-1"
              onClick={handleCreateBill}
              isLoading={submitting}
            >
              Complete Bill
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </ProtectedLayout>
  );
}
