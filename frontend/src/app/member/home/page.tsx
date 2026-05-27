'use client';

import React from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { Card, Button } from '@/components/common';
import { useAuth } from '@/hooks';
import { ShoppingCart, Gift, Ticket, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function MemberHomePage() {
  const { user } = useAuth();

  return (
    <ProtectedLayout requiredRole="member">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-success to-green-600 text-white p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.fullName}!</h1>
          <p className="text-green-100">Enjoy exclusive member benefits and rewards</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <Gift size={40} className="text-success mx-auto mb-3" />
              <p className="text-sm text-secondary mb-1">Loyalty Points</p>
              <p className="text-3xl font-bold text-dark">
                {user && 'loyaltyPoints' in user ? user.loyaltyPoints : 0}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <ShoppingCart size={40} className="text-primary mx-auto mb-3" />
              <p className="text-sm text-secondary mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-dark">
                ${user && 'totalSpent' in user ? user.totalSpent : 0}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Ticket size={40} className="text-warning mx-auto mb-3" />
              <p className="text-sm text-secondary mb-1">Member Since</p>
              <p className="text-lg font-bold text-dark">
                {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Shopping Section */}
        <Card title="Start Shopping">
          <p className="text-secondary mb-4">Browse our products and get exclusive member discounts</p>
          <Link href="/member/shop">
            <Button variant="success" className="w-full">
              View Products
            </Button>
          </Link>
        </Card>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Recent Orders" className="cursor-pointer hover:shadow-lg transition-shadow">
            <p className="text-secondary mb-4">No orders yet. Start shopping now!</p>
            <Link href="/member/orders">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </Link>
          </Card>

          <Card title="Account Info" className="cursor-pointer hover:shadow-lg transition-shadow">
            <p className="text-secondary mb-2">
              <span className="font-semibold text-dark">Membership ID:</span> {user?.id}
            </p>
            <p className="text-secondary mb-4">
              <span className="font-semibold text-dark">Email:</span> {user?.email}
            </p>
            <Link href="/member/profile">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
