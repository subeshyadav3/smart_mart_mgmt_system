'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Input, Button } from '@/components/common';
import { Lock, User, Phone } from 'lucide-react';

export default function MemberLoginPage() {
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ membershipId?: string; password?: string }>({});
  const { login } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: { membershipId?: string; password?: string } = {};

    if (!membershipId) {
      newErrors.membershipId = 'Membership ID is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({ membershipId, password }, 'member');
      router.push('/member/home');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-success mb-2">Smart Mart</h1>
          <p className="text-secondary">Member Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Membership ID</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-secondary" size={20} />
              <Input
                type="text"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                error={errors.membershipId}
                placeholder="MEM123456"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-secondary" size={20} />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="success"
            className="w-full"
            isLoading={loading}
          >
            Login as Member
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-secondary">
            Don't have an account?{' '}
            <Link href="/auth/member-register" className="text-success font-semibold hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-center text-sm text-secondary mt-3">
            Are you a staff member?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
