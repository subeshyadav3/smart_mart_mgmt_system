'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button, Input } from '@/components/common';
import { productService } from '@/services/api';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks';

export default function MemberShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { items, addItem, removeItem } = useCart();
  const cartCount = items.length;

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(page, 12, searchTerm);
      const { items, totalPages: pages } = response.data.data;
      const activeProducts = items.filter((p: Product) => p.status === 'ACTIVE');
      setProducts(activeProducts);
      setTotalPages(pages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    return item?.quantity || 0;
  };

  return (
    <ProtectedLayout requiredRole="member">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-dark">Shop</h1>
          <Link href="/member/cart">
            <Button variant="primary" className="relative">
              <ShoppingCart size={20} />
              <span className="ml-2">Cart ({cartCount})</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        <Card>
          <div className="mb-6">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-secondary">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              <p>No products found. Try a different search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const quantity = getItemQuantity(product.id);
                  const discountedPrice =
                    product.sellingPrice * (1 - product.discountPercent / 100);

                  return (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="bg-light h-32 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-dark mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-secondary mb-3">SKU: {product.sku}</p>

                        <div className="mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(discountedPrice)}
                            </span>
                            {product.discountPercent > 0 && (
                              <>
                                <span className="text-sm text-secondary line-through">
                                  {formatCurrency(product.sellingPrice)}
                                </span>
                                <span className="text-xs bg-danger text-white px-2 py-1 rounded">
                                  -{product.discountPercent}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {quantity > 0 ? (
                          <div className="flex gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              className="flex-1"
                              onClick={() => removeItem(product.id)}
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="flex-1 flex items-center justify-center font-bold text-dark">
                              {quantity}
                            </span>
                            <Button
                              variant="success"
                              size="sm"
                              className="flex-1"
                              onClick={() => addItem(product, 1)}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-full"
                            onClick={() => addItem(product, 1)}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
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
