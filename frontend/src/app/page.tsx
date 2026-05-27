'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/common';
import { Mail, Lock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Smart Mart</h1>
          <p className="text-xl text-gray-300">Professional Retail Management System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Staff Login Card */}
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-lg p-8 text-white hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <Mail size={48} className="mb-4" />
              <h2 className="text-2xl font-bold">Staff Portal</h2>
              <p className="text-blue-100 mt-2">Admin & Staff Access</p>
            </div>
            <p className="text-blue-100 mb-6">
              Manage products, inventory, sales, and staff. Complete control over your retail operations.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-primary">
                Staff Login
              </Button>
            </Link>
          </div>

          {/* Member Login Card */}
          <div className="bg-gradient-to-br from-success to-green-700 rounded-lg p-8 text-white hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <Lock size={48} className="mb-4" />
              <h2 className="text-2xl font-bold">Member Portal</h2>
              <p className="text-green-100 mt-2">Customer & Member Access</p>
            </div>
            <p className="text-green-100 mb-6">
              Shop products, track loyalty points, view order history, and enjoy exclusive member benefits.
            </p>
            <div className="space-y-2">
              <Link href="/auth/member-login">
                <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-success">
                  Member Login
                </Button>
              </Link>
              <Link href="/auth/member-register">
                <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-success">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center text-white">
            <div className="text-4xl font-bold text-primary mb-2">📦</div>
            <h3 className="font-bold mb-2">Inventory Management</h3>
            <p className="text-gray-400">Track products and stock levels in real-time</p>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl font-bold text-success mb-2">💰</div>
            <h3 className="font-bold mb-2">Billing System</h3>
            <p className="text-gray-400">Fast and accurate billing with discounts</p>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl font-bold text-warning mb-2">🎁</div>
            <h3 className="font-bold mb-2">Loyalty Program</h3>
            <p className="text-gray-400">Earn points with every purchase</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400">
          <p>© 2026 Smart Mart Management System. Professional retail solutions.</p>
        </div>
      </div>
    </div>
  );
}
