'use client';

import React from 'react';
import { Menu, LogOut, Users, Package, ShoppingCart, BarChart3, Home } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { isStaff } from '@/lib/utils';
import { useState } from 'react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout, userType } = useAuth();

  const staffMenuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Inventory', href: '/inventory', icon: ShoppingCart },
    { label: 'Staff', href: '/staff', icon: Users },
    { label: 'Sales', href: '/sales', icon: BarChart3 },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const memberMenuItems = [
    { label: 'Home', href: '/member/home', icon: Home },
    { label: 'Shop', href: '/member/shop', icon: Package },
    { label: 'Orders', href: '/member/orders', icon: ShoppingCart },
    { label: 'Loyalty Points', href: '/member/loyalty', icon: BarChart3 },
  ];

  const menuItems = userType === 'staff' ? staffMenuItems : memberMenuItems;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-dark text-white p-6 z-50 transform transition-transform md:translate-x-0 md:relative md:w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Smart Mart</h1>
          <p className="text-sm text-gray-400">{userType === 'staff' ? 'Staff Panel' : 'Member Portal'}</p>
        </div>

        <nav className="space-y-2 mb-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary transition-colors"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-danger transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-light rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 md:flex md:justify-start">
            <h1 className="text-xl font-semibold text-dark hidden md:block">Smart Mart System</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-dark">{user?.fullName || 'User'}</p>
              <p className="text-xs text-secondary">
                {isStaff(user!) ? user?.role : 'Member'}
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white text-center py-4 mt-12">
      <p className="text-sm">
        © 2026 Smart Mart Management System. All rights reserved.
      </p>
    </footer>
  );
};
