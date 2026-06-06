export const formatCurrency = (value) => {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(number) ? number : 0);
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

export const formatNumber = (value) => {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat('en-US').format(Number.isFinite(number) ? number : 0);
};

export const capitalize = (value) => {
  if (!value) return '-';
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
