'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button } from '@/components/common';
import { productService, salesService } from '@/services/api';
import { useAuth } from '@/hooks';
import { BarChart3, Package, Users, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, salesRes] = await Promise.all([
          productService.getProducts(1, 100),
          salesService.getBills(1, 100),
        ]);

        const products = productsRes.data.data.items || [];
        const bills = salesRes.data.data.items || [];

        setStats({
          totalProducts: products.length,
          lowStockProducts: products.filter((p: any) => p.stockQuantity <= p.minimumStock)
            .length,
          totalSales: bills.length,
          totalMembers: 0,
        });
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="text-center">Loading...</div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout requiredRole="staff">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-dark">Welcome, {user?.fullName}!</h1>
          <p className="text-secondary mt-2">Here's your dashboard overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary mb-1">Total Products</p>
                <p className="text-3xl font-bold text-dark">{stats.totalProducts}</p>
              </div>
              <Package size={40} className="text-primary opacity-20" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary mb-1">Low Stock Items</p>
                <p className="text-3xl font-bold text-dark">{stats.lowStockProducts}</p>
              </div>
              <ShoppingCart size={40} className="text-warning opacity-20" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-dark">{stats.totalSales}</p>
              </div>
              <BarChart3 size={40} className="text-success opacity-20" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary mb-1">Active Members</p>
                <p className="text-3xl font-bold text-dark">{stats.totalMembers}</p>
              </div>
              <Users size={40} className="text-primary opacity-20" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/products">
              <Button variant="primary" className="w-full">
                Manage Products
              </Button>
            </Link>
            <Link href="/sales/new-bill">
              <Button variant="success" className="w-full">
                Create Bill
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="secondary" className="w-full">
                View Inventory
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Quick Stats">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-light rounded">
              <span className="text-secondary">Products in Stock</span>
              <span className="font-bold text-dark">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-light rounded">
              <span className="text-secondary">Need Restocking</span>
              <span className="font-bold text-danger">{stats.lowStockProducts}</span>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
