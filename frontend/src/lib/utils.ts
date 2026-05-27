import { Staff, Member } from '@/types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const isStaff = (user: Staff | Member): user is Staff => {
  return 'email' in user && 'role' in user;
};

export const isMember = (user: Staff | Member): user is Member => {
  return 'membershipId' in user;
};

export const cn = (...classes: (string | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
