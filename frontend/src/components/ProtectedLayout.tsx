'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Header, Footer } from '@/components/Layout';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'staff' | 'member' | 'admin';
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }

    if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      userType !== requiredRole
    ) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, requiredRole, userType, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
