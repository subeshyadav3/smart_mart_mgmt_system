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
      <div className="page-stack">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Member portal</p>
            <h2>Welcome back, {user?.fullName || 'Member'}</h2>
            <p>View your membership profile, loyalty points, and recent purchases.</p>
          </div>
          <Badge tone={user?.isActive ? 'success' : 'danger'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge>
        </div>

        <section className="stats-grid">
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid-2">
          <Card>
            <CardHeader title="Profile" subtitle="Membership details" />
            <CardBody>
              <div className="info-list">
                <div><span>Full name</span><strong>{user?.fullName || '-'}</strong></div>
                <div><span>Phone number</span><strong>{user?.phoneNumber || '-'}</strong></div>
                <div><span>Member since</span><strong>{formatDateTime(user?.createdAt)}</strong></div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent purchases" subtitle="Latest bills for this account" />
            <CardBody>
              {loading ? (
                <div className="empty-table">Loading purchases...</div>
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
                <EmptyState title="No purchases yet" description="Sales history will appear here after your first checkout." />
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    );
  }

  if (loading) {
    return <div className="center-screen">Loading dashboard...</div>;
  }

  const topMembers = payload.analytics?.topMembers || [];
  const topProducts = payload.analytics?.topProducts || [];
  const salesOverTime = payload.analytics?.salesOverTime || [];
  const paymentBreakdown = payload.analytics?.paymentBreakdown || [];

  return (
    <div className="page-stack">
      <section className="stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid-2">
        <Card>
          <CardHeader title="Recent products" subtitle="Inventory snapshot" />
          <CardBody>
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
              <EmptyState title="No products yet" description="Add your first product to start managing stock." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={user?.role === 'ADMIN' ? 'Recent sales' : 'My recent sales'} subtitle="Latest checkout activity" />
          <CardBody>
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
              <EmptyState title="No sales yet" description="Checkout records will appear after bills are created." />
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid-2">
        <Card>
          <CardHeader title="Sales over time" subtitle={user?.role === 'ADMIN' ? 'Trend for all completed sales' : 'Trend for your completed sales'} />
          <CardBody>
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
              <EmptyState title="No trend data yet" description="Completed sales will populate this graph table automatically." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Payment mix" subtitle="Distribution of payment methods" />
          <CardBody>
            {paymentBreakdown.length ? (
              <DataTable
                columns={[
                  { key: 'method', label: 'Method' },
                  { key: 'count', label: 'Transactions' },
                ]}
                rows={paymentBreakdown}
              />
            ) : (
              <EmptyState title="No payment data" description="Payment analytics will appear after completed transactions." />
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid-2">
        <Card>
          <CardHeader title="Top 5 membership customers" subtitle="Highest spenders in selected period" />
          <CardBody>
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
              <EmptyState title="No member spenders yet" description="Top membership customers appear after linked member purchases." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top performing products" subtitle="Best revenue products in period" />
          <CardBody>
            {topProducts.length ? (
              <DataTable
                columns={[
                  { key: 'name', label: 'Product' },
                  { key: 'sku', label: 'SKU' },
                  { key: 'quantity', label: 'Qty sold' },
                  { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) },
                ]}
                rows={topProducts}
              />
            ) : (
              <EmptyState title="No product analytics yet" description="Product EDA will populate as sales are created." />
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
