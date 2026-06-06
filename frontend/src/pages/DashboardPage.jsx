import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listProducts } from '../services/products';
import { getSalesAnalytics, listSales } from '../services/sales';
import { listMembers } from '../services/auth';
import { listStaffs } from '../services/workforce';
import { formatCurrency, formatDateTime, formatNumber } from '../utils/formatters';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import GuardedMessage from '../components/layout/GuardedMessage';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState({ products: [], sales: [], members: [], staffs: [], analytics: null });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const tasks = [listProducts({ limit: 5 })];
        if (user?.type === 'MEMBER') {
          tasks.push(listSales({ limit: 5, memberId: user?.id }));
          tasks.push(Promise.resolve({ data: [] }));
          tasks.push(Promise.resolve({ data: [] }));
          tasks.push(Promise.resolve({ data: null }));
        } else {
          tasks.push(listSales({ limit: 5 }));
          tasks.push(listMembers());
          tasks.push(user?.role === 'ADMIN' ? listStaffs() : Promise.resolve({ data: [] }));
          tasks.push(getSalesAnalytics({ days: 45, ...(user?.role === 'STAFF' ? { staffId: user?.id } : {}) }));
        }

        const [productsResponse, salesResponse, membersResponse, staffsResponse, analyticsResponse] = await Promise.all(tasks);
        setPayload({
          products: productsResponse?.data || [],
          sales: salesResponse?.data || [],
          members: membersResponse?.data || [],
          staffs: staffsResponse?.data || [],
          analytics: analyticsResponse?.data || null,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.role, user?.type]);

  const stats = useMemo(() => {
    if (user?.type === 'MEMBER') {
      return [
        { label: 'Membership ID', value: user?.membershipId || '-', hint: 'Your active account', tone: 'blue', icon: 'ID' },
        { label: 'Loyalty points', value: formatNumber(user?.loyaltyPoints), hint: 'Earned from purchases', tone: 'green', icon: 'LP' },
        { label: 'Total spent', value: formatCurrency(user?.totalSpent), hint: 'Lifetime contribution', tone: 'violet', icon: '$' },
      ];
    }

    const summary = payload.analytics?.summary;
    if (summary) {
      const isStaff = user?.role === 'STAFF';
      return [
        {
          label: user?.role === 'ADMIN' ? 'Total sales (period)' : 'My sales (period)',
          value: formatCurrency(summary.totalSalesAmount),
          hint: `${summary.periodDays} day window`,
          tone: 'green',
          icon: 'TS',
        },
        {
          label: user?.role === 'ADMIN' ? 'Bills processed' : 'My bills processed',
          value: formatNumber(summary.totalBills),
          hint: 'Completed bills only',
          tone: 'blue',
          icon: 'BL',
        },
        {
          label: isStaff ? 'Members served' : 'Average bill value',
          value: isStaff ? formatNumber(summary.membersServed) : formatCurrency(summary.averageBillValue),
          hint: isStaff ? 'Unique members in your bills' : 'Revenue per completed bill',
          tone: 'violet',
          icon: isStaff ? 'MS' : 'AV',
        },
        {
          label: isStaff ? 'Product stock actions' : 'Registered members',
          value: isStaff ? formatNumber(summary.stockActions) : formatNumber(payload.members.length),
          hint: isStaff ? 'Inventory updates by you' : 'Membership accounts',
          tone: 'gold',
          icon: isStaff ? 'PA' : 'MB',
        },
      ];
    }

    return [
      { label: 'Products', value: formatNumber(payload.products.length), hint: 'Active inventory items', tone: 'blue', icon: 'PR' },
      { label: 'Sales', value: formatNumber(payload.sales.length), hint: 'Recent bills', tone: 'green', icon: 'SL' },
      { label: 'Members', value: formatNumber(payload.members.length), hint: 'Registered customers', tone: 'violet', icon: 'MB' },
      { label: 'Staffs', value: formatNumber(payload.staffs.length), hint: 'Active team members', tone: 'gold', icon: 'ST' },
    ];
  }, [payload, user]);

  if (user?.type === 'MEMBER') {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Member portal</p>
            <h2 className="text-xl font-bold text-slate-900">Welcome back, {user?.fullName || 'Member'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">View your membership profile, loyalty points, and recent purchases.</p>
          </div>
          <div className="self-start sm:self-center">
            <Badge tone={user?.isActive ? 'success' : 'danger'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
            <CardHeader title="Profile" subtitle="Membership details" />
            <CardBody className="p-5">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-500">Full name</span>
                  <strong className="text-sm font-semibold text-slate-800">{user?.fullName || '-'}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-500">Phone number</span>
                  <strong className="text-sm font-semibold text-slate-800">{user?.phoneNumber || '-'}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-500">Member since</span>
                  <strong className="text-sm font-semibold text-slate-800">{formatDateTime(user?.createdAt)}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
            <CardHeader title="Recent purchases" subtitle="Latest bills for this account" />
            <CardBody className="p-0">
              {loading ? (
                <div className="p-6 text-center text-sm text-slate-400">Loading purchases...</div>
              ) : payload.sales?.length ? (
                <DataTable
                  columns={[
                    { key: 'billNumber', label: 'Bill' },
                    { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'CANCELLED' ? 'danger' : 'success'}>{row.status}</Badge> },
                    { key: 'finalAmount', label: 'Amount', render: (row) => formatCurrency(row.finalAmount) },
                    { key: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
                  ]}
                  rows={payload.sales}
                />
              ) : (
                <div className="p-6">
                  <EmptyState title="No purchases yet" description="Sales history will appear here after your first checkout." />
                </div>
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-sm text-slate-400 font-medium">
        Loading dashboard...
      </div>
    );
  }

  const topMembers = payload.analytics?.topMembers || [];
  const topProducts = payload.analytics?.topProducts || [];
  const salesOverTime = payload.analytics?.salesOverTime || [];
  const paymentBreakdown = payload.analytics?.paymentBreakdown || [];

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
          <CardHeader title="Recent products" subtitle="Inventory snapshot" />
          <CardBody className="p-0">
            {payload.products.length ? (
              <DataTable
                columns={[
                  { key: 'name', label: 'Product' },
                  { key: 'sku', label: 'SKU' },
                  { key: 'stockQuantity', label: 'Stock' },
                  { key: 'sellingPrice', label: 'Price', render: (row) => formatCurrency(row.sellingPrice) },
                ]}
                rows={payload.products}
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No products yet" description="Add your first product to start managing stock." />
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
          <CardHeader title={user?.role === 'ADMIN' ? 'Recent sales' : 'My recent sales'} subtitle="Latest checkout activity" />
          <CardBody className="p-0">
            {payload.sales.length ? (
              <DataTable
                columns={[
                  { key: 'billNumber', label: 'Bill' },
                  { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'CANCELLED' ? 'danger' : 'success'}>{row.status}</Badge> },
                  { key: 'finalAmount', label: 'Amount', render: (row) => formatCurrency(row.finalAmount) },
                  { key: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
                ]}
                rows={payload.sales}
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No sales yet" description="Checkout records will appear after bills are created." />
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
          <CardHeader title="Sales over time" subtitle={user?.role === 'ADMIN' ? 'Trend for all completed sales' : 'Trend for your completed sales'} />
          <CardBody className="p-0">
            {salesOverTime.length ? (
              <DataTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'bills', label: 'Bills' },
                  { key: 'sales', label: 'Sales', render: (row) => formatCurrency(row.sales) },
                ]}
                rows={salesOverTime}
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No trend data yet" description="Completed sales will populate this graph table automatically." />
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
          <CardHeader title="Payment mix" subtitle="Distribution of payment methods" />
          <CardBody className="p-0">
            {paymentBreakdown.length ? (
              <DataTable
                columns={[
                  { key: 'method', label: 'Method' },
                  { key: 'count', label: 'Transactions' },
                ]}
                rows={paymentBreakdown}
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No payment data" description="Payment analytics will appear after completed transactions." />
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
          <CardHeader title="Top 5 membership customers" subtitle="Highest spenders in selected period" />
          <CardBody className="p-0">
            {topMembers.length ? (
              <DataTable
                columns={[
                  { key: 'fullName', label: 'Customer' },
                  { key: 'membershipId', label: 'Membership' },
                  { key: 'totalBills', label: 'Bills' },
                  { key: 'totalSpent', label: 'Spent', render: (row) => formatCurrency(row.totalSpent) },
                ]}
                rows={topMembers}
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No member spenders yet" description="Top membership customers appear after linked member purchases." />
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
          <CardHeader title="Top performing products" subtitle="Best revenue products in period" />
          <CardBody className="p-0">
            {topProducts.length ? (
              <DataTable
                columns={[
                  { key: 'name', label: 'Product' },
                  { key: 'sku', label: 'SKU' },
                  { key: 'text-[13px] text-slate-500', label: 'Qty sold', key: 'quantity' },
                  { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) },
                ]}
                rows={topProducts}
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No product analytics yet" description="Product EDA will populate as sales are created." />
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}