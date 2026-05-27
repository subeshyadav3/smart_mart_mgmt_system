'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button, Input, Select } from '@/components/common';
import { productService } from '@/services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    buyingPrice: '',
    sellingPrice: '',
    discountPercent: '',
    stockQuantity: '',
    minimumStock: '',
    categoryId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await productService.createProduct({
        ...formData,
        buyingPrice: parseFloat(formData.buyingPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        discountPercent: parseFloat(formData.discountPercent),
        stockQuantity: parseInt(formData.stockQuantity),
        minimumStock: parseInt(formData.minimumStock),
      });

      toast.success('Product created successfully');
      router.push('/products');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="staff">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="secondary" size="sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-dark">Create Product</h1>
        </div>

        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
              />
              <Input
                label="Category ID"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              as="textarea"
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Buying Price"
                name="buyingPrice"
                type="number"
                step="0.01"
                value={formData.buyingPrice}
                onChange={handleChange}
                required
              />
              <Input
                label="Selling Price"
                name="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
              <Input
                label="Discount %"
                name="discountPercent"
                type="number"
                step="0.01"
                value={formData.discountPercent}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
              />
              <Input
                label="Minimum Stock"
                name="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" isLoading={loading}>
                Create Product
              </Button>
              <Link href="/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
