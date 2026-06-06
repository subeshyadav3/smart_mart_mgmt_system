import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import GuardedMessage from '../components/layout/GuardedMessage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createSale, getSale, getSaleAudit, listSales, updateSale } from '../services/sales';
import { listProducts } from '../services/products';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const defaultItem = () => ({ productId: '', quantity: '1', discountPercent: '0' });
const canEditSaleNow = (sale) => {
  if (!sale) return false;
  if (typeof sale.canEdit === 'boolean') return sale.canEdit;
  if (!sale?.createdAt || sale.status === 'CANCELLED') return false;
  return Date.now() - new Date(sale.createdAt).getTime() <= 60 * 1000;
};

export default function SalesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canCreate = ['ADMIN', 'STAFF'].includes(user?.role);
  const isMember = user?.type === 'MEMBER';

  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [saleDetail, setSaleDetail] = useState(null);
  const [saleAudit, setSaleAudit] = useState([]);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState({
    memberId: '',
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    items: [defaultItem()],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesResponse, productsResponse] = await Promise.all([
        listSales(isMember ? { memberId: user?.id, search, limit: 50 } : { search, limit: 50 }),
        canCreate ? listProducts({ limit: 200 }) : Promise.resolve({ data: [] }),
      ]);
      setSales(salesResponse?.data || []);
      setProducts(productsResponse?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, search]);

  const productLookup = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const draftSummary = useMemo(() => {
    const rows = draft.items
      .map((item) => {
        const product = productLookup.get(item.productId);
        if (!product) return null;
        const qty = Number(item.quantity) || 0;
        const price = Number(product.sellingPrice) || 0;
        const discountPercent = Number(item.discountPercent) || 0;
        const subtotal = qty * price;
        const discount = subtotal * (discountPercent / 100);
        const total = subtotal - discount;
        return {
          product,
          qty,
          price,
          discountPercent,
          subtotal,
          discount,
          total,
        };
      })
      .filter(Boolean);

    const subtotal = rows.reduce((sum, row) => sum + row.subtotal, 0);
    const discount = rows.reduce((sum, row) => sum + row.discount, 0);
    const grandTotal = subtotal - discount;

    return { rows, subtotal, discount, grandTotal };
  }, [draft.items, productLookup]);

  const updateItem = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => setDraft((current) => ({ ...current, items: [...current.items, defaultItem()] }));
  const removeItem = (index) =>
    setDraft((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));

  const openCreate = () => {
    setEditingSale(null);
    setDraft({ memberId: '', paymentMethod: 'CASH', status: 'COMPLETED', items: [defaultItem()] });
    setInvoiceOpen(false);
    setCreateOpen(true);
  };

  const openEditSale = async (sale) => {
    if (!canEditSaleNow(sale)) {
      showToast('Sales can only be edited within 1 minute of creation', 'danger');
      return;
    }
    setSaving(true);
    try {
      const detailResponse = await getSale(sale.id);
      const data = detailResponse?.data;
      setEditingSale(data);
      setDraft({
        memberId: data?.memberId || data?.customer?.id || '',
        paymentMethod: data?.paymentMethod || 'CASH',
        status: data?.status || 'COMPLETED',
        items: (data?.items || data?.billItems || []).map((item) => ({
          productId: item.productId,
          quantity: String(item.quantity),
          discountPercent: String(item.discountPercent ?? 0),
        })),
      });
      setInvoiceOpen(false);
      setCreateOpen(true);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const openSaleDetail = async (sale) => {
    setSaving(true);
    try {
      const [detailResponse, auditResponse] = await Promise.all([getSale(sale.id), getSaleAudit(sale.id)]);
      setSaleDetail(detailResponse?.data || null);
      setSaleAudit(auditResponse?.data || []);
      setDetailOpen(true);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const submitSale = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        memberId: draft.memberId || undefined,
        paymentMethod: draft.paymentMethod,
        status: draft.status,
        items: draft.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          discountPercent: Number(item.discountPercent),
        })),
      };

      if (editingSale?.id) {
        await updateSale(editingSale.id, payload);
        showToast('Sale updated successfully');
      } else {
        await createSale(payload);
        showToast('Sale created successfully');
      }

      setCreateOpen(false);
      setDraft({ memberId: '', paymentMethod: 'CASH', status: 'COMPLETED', items: [defaultItem()] });
      setEditingSale(null);
      await loadData();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'billNumber', label: 'Bill' },
      { key: 'customer', label: 'Customer', render: (row) => row.customer?.fullName || row.member?.fullName || 'Walk-in' },
      { key: 'cashier', label: 'Cashier', render: (row) => row.cashier?.fullName || row.createdBy?.fullName || '-' },
      { key: 'items', label: 'Items', render: (row) => (row.items?.length || row.billItems?.length || 0) },
      { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'CANCELLED' ? 'danger' : row.status === 'PENDING' ? 'warning' : 'success'}>{row.status}</Badge> },
      { key: 'finalAmount', label: 'Total', render: (row) => formatCurrency(row.finalAmount) },
      { key: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => openSaleDetail(row)}>View</Button>
            {canCreate ? (
              <Button size="sm" variant="ghost" onClick={() => openEditSale(row)} disabled={!canEditSaleNow(row)}>
                Edit
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canCreate],
  );

  if (!canCreate && !isMember) {
    return <GuardedMessage title="Access denied" description="Sales management is available for staff, administrators, and members reviewing their own bills." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
        <CardHeader
          title="Sales register"
          subtitle={canCreate ? 'Create sales, preview invoice totals, and manage/edit bills with audit visibility.' : 'Review your sales history and bill details.'}
          actions={
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bill, member, or cashier" />
              </div>
              <Button onClick={loadData}>Search</Button>
              {canCreate ? (
                <Button variant="secondary" onClick={openCreate}>New sale</Button>
              ) : null}
            </div>
          }
        />
        <CardBody className="p-0">
          <div className="border border-slate-100 rounded-lg overflow-hidden m-6">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-400 font-medium">Loading sales...</div>
            ) : sales.length ? (
              <DataTable columns={columns} rows={sales} />
            ) : (
              <div className="p-6">
                <EmptyState title="No sales found" description="Bills created from the checkout form will appear here." actionLabel={canCreate ? 'New sale' : undefined} onAction={openCreate} />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={createOpen}
        title={editingSale ? `Edit sale ${editingSale.billNumber}` : 'Create sale'}
        description="Add products using the plus button, preview invoice totals, then submit."
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => setInvoiceOpen((prev) => !prev)}>
              {invoiceOpen ? 'Hide invoice preview' : 'Show invoice preview'}
            </Button>
            <Button onClick={submitSale} disabled={saving}>{saving ? 'Processing...' : editingSale ? 'Update sale' : 'Create sale'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Input label="Member ID" value={draft.memberId} onChange={(event) => setDraft({ ...draft, memberId: event.target.value })} placeholder="Optional" />
          <Select label="Payment method" value={draft.paymentMethod} onChange={(event) => setDraft({ ...draft, paymentMethod: event.target.value })}>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="DIGITAL_WALLET">Digital wallet</option>
          </Select>
          <Select label="Status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </Select>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Items</h4>
            <Button variant="secondary" size="sm" onClick={addItem}>+ Add product</Button>
          </div>

          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
            {draft.items.map((item, index) => {
              const selectedProduct = productLookup.get(item.productId);
              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50/50 border border-slate-100 rounded-lg p-4 relative" key={index}>
                  <div className="md:col-span-5">
                    <Select label={`Product ${index + 1}`} value={item.productId} onChange={(event) => updateItem(index, 'productId', event.target.value)}>
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {formatCurrency(product.sellingPrice)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Qty" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Discount %" type="number" min="0" step="0.01" value={item.discountPercent} onChange={(event) => updateItem(index, 'discountPercent', event.target.value)} />
                  </div>
                  <div className="md:col-span-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2 md:mt-0">
                    <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => removeItem(index)}>Remove</Button>
                    <p className="text-xs font-medium text-slate-400 truncate max-w-[120px]">{selectedProduct ? `Stock: ${selectedProduct.stockQuantity}` : 'No selection'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {invoiceOpen ? (
          <Card className="mt-6 bg-slate-50 border border-slate-200/60 rounded-lg shadow-none">
            <CardHeader title="Invoice preview" subtitle="Review before finalizing this sale" className="pb-2" />
            <CardBody className="p-4 flex flex-col gap-4">
              <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                {draftSummary.rows.length ? (
                  <DataTable
                    columns={[
                      { key: 'product', label: 'Product', render: (row) => row.product.name },
                      { key: 'qty', label: 'Qty' },
                      { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
                      { key: 'discountPercent', label: 'Discount %' },
                      { key: 'total', label: 'Line total', render: (row) => formatCurrency(row.total) },
                    ]}
                    rows={draftSummary.rows}
                  />
                ) : (
                  <div className="p-4">
                    <EmptyState title="No items" description="Add at least one product to see invoice preview." />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 max-w-xs ml-auto w-full text-sm border-t border-slate-200/60 pt-3">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(draftSummary.subtotal)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Total Discount</span><span className="text-emerald-600">-{formatCurrency(draftSummary.discount)}</span></div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200/60 pt-2 mt-1"><span>Grand Total</span><span>{formatCurrency(draftSummary.grandTotal)}</span></div>
              </div>
            </CardBody>
          </Card>
        ) : null}
      </Modal>

      <Modal
        open={detailOpen}
        title={saleDetail ? `Sale details: ${saleDetail.billNumber}` : 'Sale details'}
        description="Detailed items, cashier info, and edit logs for this bill."
        onClose={() => setDetailOpen(false)}
        footer={
          <div className="flex justify-end w-full">
            <Button onClick={() => setDetailOpen(false)}>Close</Button>
          </div>
        }
      >
        {saleDetail ? (
          <div className="flex flex-col gap-6">
            <Card className="bg-slate-50/50 border border-slate-200/60 rounded-lg shadow-none">
              <CardHeader title="Bill overview" subtitle="Core checkout information" className="pb-2" />
              <CardBody className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  <div className="flex flex-col gap-0.5"><span className="text-xs font-medium text-slate-400 uppercase">Customer</span><strong className="text-slate-800 font-semibold">{saleDetail.customer?.fullName || saleDetail.member?.fullName || 'Walk-in customer'}</strong></div>
                  <div className="flex flex-col gap-0.5"><span className="text-xs font-medium text-slate-400 uppercase">Cashier</span><strong className="text-slate-800 font-semibold">{saleDetail.cashier?.fullName || saleDetail.createdBy?.fullName || '-'}</strong></div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-slate-400 uppercase">Status</span>
                    <div><Badge tone={saleDetail.status === 'CANCELLED' ? 'danger' : saleDetail.status === 'PENDING' ? 'warning' : 'success'}>{saleDetail.status}</Badge></div>
                  </div>
                  <div className="flex flex-col gap-0.5"><span className="text-xs font-medium text-slate-400 uppercase">Payment</span><strong className="text-slate-800 font-semibold">{saleDetail.paymentMethod}</strong></div>
                  <div className="flex flex-col gap-0.5"><span className="text-xs font-medium text-slate-400 uppercase">Editable until</span><strong className="text-slate-800 font-semibold">{saleDetail.editableUntil ? formatDateTime(saleDetail.editableUntil) : '-'}</strong></div>
                  <div className="flex flex-col gap-0.5"><span className="text-xs font-medium text-slate-400 uppercase">Total</span><strong className="text-slate-900 font-bold text-base">{formatCurrency(saleDetail.finalAmount)}</strong></div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
              <CardHeader title="Products in this sale" subtitle="Every product line in this bill" />
              <CardBody className="p-0">
                <div className="border border-slate-100 rounded-lg overflow-hidden m-4 bg-white">
                  <DataTable
                    columns={[
                      { key: 'product', label: 'Product', render: (row) => row.product?.name || '-' },
                      { key: 'sku', label: 'SKU', render: (row) => row.product?.sku || '-' },
                      { key: 'quantity', label: 'Qty' },
                      { key: 'productPrice', label: 'Price', render: (row) => formatCurrency(row.productPrice) },
                      { key: 'discountPercent', label: 'Discount %' },
                      { key: 'totalPrice', label: 'Line total', render: (row) => formatCurrency(row.totalPrice) },
                    ]}
                    rows={saleDetail.items || saleDetail.billItems || []}
                  />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-slate-200 rounded-lg shadow-none">
              <CardHeader title="Edit and inventory logs" subtitle="Traceability for sale updates" />
              <CardBody className="p-0">
                <div className="border border-slate-100 rounded-lg overflow-hidden m-4 bg-white">
                  {saleAudit.length ? (
                    <DataTable
                      columns={[
                        { key: 'createdAt', label: 'When', render: (row) => formatDateTime(row.createdAt) },
                        { key: 'reason', label: 'Reason' },
                        { key: 'product', label: 'Product', render: (row) => row.product?.name || '-' },
                        { key: 'changeAmount', label: 'Stock Δ' },
                        { key: 'updatedBy', label: 'By', render: (row) => row.updatedBy?.fullName || '-' },
                      ]}
                      rows={saleAudit}
                    />
                  ) : (
                    <div className="p-6">
                      <EmptyState title="No edit logs yet" description="Logs will appear if this sale is edited/cancelled or inventory is adjusted." />
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-slate-400 font-medium">Loading details...</div>
        )}
      </Modal>
    </div>
  );
}