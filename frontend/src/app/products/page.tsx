'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button, Input, Select, Modal } from '@/components/common';
import { productService } from '@/services/api';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(page, 10, searchTerm);
      const { items, totalPages: pages } = response.data.data;
      setProducts(items);
      setTotalPages(pages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <ProtectedLayout requiredRole="staff">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-dark">Products</h1>
          <Link href="/products/create">
            <Button variant="primary">
              <Plus size={20} className="mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <Card>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-secondary" size={20} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              <p>No products found. Create one to get started!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-200 hover:bg-light">
                        <td className="px-6 py-4 font-medium text-dark">{product.name}</td>
                        <td className="px-6 py-4 text-secondary text-sm">{product.sku}</td>
                        <td className="px-6 py-4 font-semibold text-dark">
                          {formatCurrency(product.sellingPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.stockQuantity <= product.minimumStock
                                ? 'bg-danger bg-opacity-20 text-danger'
                                : 'bg-success bg-opacity-20 text-success'
                            }`}
                          >
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.status === 'ACTIVE'
                                ? 'bg-success bg-opacity-20 text-success'
                                : 'bg-secondary bg-opacity-20 text-secondary'
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button variant="secondary" size="sm">
                              <Edit2 size={16} />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
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
