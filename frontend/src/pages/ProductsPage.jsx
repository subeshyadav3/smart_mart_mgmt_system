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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="inline-actions">
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
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Sales register"
          subtitle={canCreate ? 'Create sales, preview invoice totals, and manage/edit bills with audit visibility.' : 'Review your sales history and bill details.'}
          actions={
            <div className="header-actions">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bill, member, or cashier" />
              <Button onClick={loadData}>Search</Button>
              {canCreate ? (
                <Button variant="secondary" onClick={openCreate}>New sale</Button>
              ) : null}
            </div>
          }
        />
        <CardBody>
          {loading ? (
            <div className="empty-table">Loading sales...</div>
          ) : sales.length ? (
            <DataTable columns={columns} rows={sales} />
          ) : (
            <EmptyState title="No sales found" description="Bills created from the checkout form will appear here." actionLabel={canCreate ? 'New sale' : undefined} onAction={openCreate} />
          )}
        </CardBody>
      </Card>

      <Modal
        open={createOpen}
        title={editingSale ? `Edit sale ${editingSale.billNumber}` : 'Create sale'}
        description="Add products using the plus button, preview invoice totals, then submit."
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => setInvoiceOpen((prev) => !prev)}>
              {invoiceOpen ? 'Hide invoice preview' : 'Show invoice preview'}
            </Button>
            <Button onClick={submitSale} disabled={saving}>{saving ? 'Processing...' : editingSale ? 'Update sale' : 'Create sale'}</Button>
          </>
        }
      >
        <div className="form-grid two-columns">
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

        <div className="line-items">
          <div className="line-items-head">
            <h4>Items</h4>
            <Button variant="secondary" size="sm" onClick={addItem}>+ Add product</Button>
          </div>

          {draft.items.map((item, index) => {
            const selectedProduct = productLookup.get(item.productId);
            return (
              <div className="line-item" key={index}>
                <Select label={`Product ${index + 1}`} value={item.productId} onChange={(event) => updateItem(index, 'productId', event.target.value)}>
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {formatCurrency(product.sellingPrice)}
                    </option>
                  ))}
                </Select>
                <Input label="Qty" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
                <Input label="Discount %" type="number" min="0" step="0.01" value={item.discountPercent} onChange={(event) => updateItem(index, 'discountPercent', event.target.value)} />
                <div className="line-item-actions">
                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>Remove</Button>
                  <p className="muted-text">{selectedProduct ? `Stock ${selectedProduct.stockQuantity}` : 'Choose a product'}</p>
                </div>
              </div>
            );
          })}
        </div>

        {invoiceOpen ? (
          <Card className="mt-12">
            <CardHeader title="Invoice preview" subtitle="Review before finalizing this sale" />
            <CardBody>
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
                <EmptyState title="No items" description="Add at least one product to see invoice preview." />
              )}
              <div className="info-list" style={{ marginTop: 12 }}>
                <div><span>Subtotal</span><strong>{formatCurrency(draftSummary.subtotal)}</strong></div>
                <div><span>Total Discount</span><strong>{formatCurrency(draftSummary.discount)}</strong></div>
                <div><span>Grand Total</span><strong>{formatCurrency(draftSummary.grandTotal)}</strong></div>
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
        footer={<Button onClick={() => setDetailOpen(false)}>Close</Button>}
      >
        {saleDetail ? (
          <div className="page-stack">
            <Card>
              <CardHeader title="Bill overview" subtitle="Core checkout information" />
              <CardBody>
                <div className="info-list">
                  <div><span>Customer</span><strong>{saleDetail.customer?.fullName || saleDetail.member?.fullName || 'Walk-in customer'}</strong></div>
                  <div><span>Cashier</span><strong>{saleDetail.cashier?.fullName || saleDetail.createdBy?.fullName || '-'}</strong></div>
                  <div><span>Status</span><strong>{saleDetail.status}</strong></div>
                  <div><span>Payment</span><strong>{saleDetail.paymentMethod}</strong></div>
                  <div><span>Editable until</span><strong>{saleDetail.editableUntil ? formatDateTime(saleDetail.editableUntil) : '-'}</strong></div>
                  <div><span>Total</span><strong>{formatCurrency(saleDetail.finalAmount)}</strong></div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Products in this sale" subtitle="Every product line in this bill" />
              <CardBody>
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
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Edit and inventory logs" subtitle="Traceability for sale updates" />
              <CardBody>
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
                  <EmptyState title="No edit logs yet" description="Logs will appear if this sale is edited/cancelled or inventory is adjusted." />
                )}
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="empty-table">Loading details...</div>
        )}
      </Modal>
    </div>
  );
}
