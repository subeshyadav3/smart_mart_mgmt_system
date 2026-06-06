import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import GuardedMessage from '../components/layout/GuardedMessage';
import { adjustStock, createProduct, listProducts, removeProduct, updateProduct } from '../services/products';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const initialForm = {
  name: '',
  sku: '',
  barcode: '',
  description: '',
  imageUrl: '',
  buyingPrice: '',
  sellingPrice: '',
  discountPercent: '0',
  stockQuantity: '0',
  minimumStock: '5',
  categoryId: '',
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeStockProduct, setActiveStockProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [stockForm, setStockForm] = useState({ changeAmount: '', reason: '' });

  const canEdit = ['ADMIN', 'STAFF'].includes(user?.role);

  const fetchProducts = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await listProducts({ ...nextFilters, limit: 100 });
      setProducts(response?.data || []);
      setMeta(response?.meta || { total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setEditorOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      buyingPrice: String(product.buyingPrice ?? ''),
      sellingPrice: String(product.sellingPrice ?? ''),
      discountPercent: String(product.discountPercent ?? 0),
      stockQuantity: String(product.stockQuantity ?? 0),
      minimumStock: String(product.minimumStock ?? 5),
      categoryId: product.categoryId || '',
    });
    setEditorOpen(true);
  };

  const openStock = (product) => {
    setActiveStockProduct(product);
    setStockForm({ changeAmount: '', reason: '' });
    setStockOpen(true);
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        buyingPrice: Number(form.buyingPrice),
        sellingPrice: Number(form.sellingPrice),
        discountPercent: Number(form.discountPercent),
        stockQuantity: Number(form.stockQuantity),
        minimumStock: Number(form.minimumStock),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showToast('Product updated');
      } else {
        await createProduct(payload);
        showToast('Product created');
      }

      setEditorOpen(false);
      await fetchProducts();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const submitStock = async (event) => {
    event.preventDefault();
    if (!activeStockProduct) return;

    setSaving(true);
    try {
      await adjustStock(activeStockProduct.id, {
        changeAmount: Number(stockForm.changeAmount),
        reason: stockForm.reason,
      });
      showToast('Stock adjusted');
      setStockOpen(false);
      await fetchProducts();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await removeProduct(product.id);
      showToast('Product deleted');
      await fetchProducts();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'categoryId', label: 'Category ID' },
      {
        key: 'stockQuantity',
        label: 'Stock',
        render: (row) => <Badge tone={row.stockQuantity <= row.minimumStock ? 'warning' : 'success'}>{row.stockQuantity}</Badge>,
      },
      { key: 'sellingPrice', label: 'Price', render: (row) => formatCurrency(row.sellingPrice) },
      { key: 'updatedAt', label: 'Updated', render: (row) => formatDateTime(row.updatedAt) },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="inline-actions">
            <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openStock(row)}>
              Stock
            </Button>
            <Button variant="danger" size="sm" onClick={() => deleteProduct(row)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (!canEdit) {
    return <GuardedMessage title="Access denied" description="Only staff and administrators can manage products." />;
  }

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Inventory catalog"
          subtitle="Search, filter deeply, update stock, and manage product details."
          actions={
            <div className="header-actions">
              <Input
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Search by name, SKU, or barcode"
              />
              <Button onClick={() => fetchProducts()}>Apply</Button>
              <Button variant="secondary" onClick={openCreate}>
                New product
              </Button>
            </div>
          }
        />
        <CardBody>
          <div className="form-grid two-columns" style={{ marginBottom: 16 }}>
            <Input label="Min price" type="number" value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} />
            <Input label="Max price" type="number" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} />
            <Input label="Min stock" type="number" value={filters.minStock} onChange={(event) => setFilters({ ...filters, minStock: event.target.value })} />
            <Input label="Max stock" type="number" value={filters.maxStock} onChange={(event) => setFilters({ ...filters, maxStock: event.target.value })} />
            <select className="input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="">All status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
              <option value="DISCONTINUED">DISCONTINUED</option>
            </select>
            <select className="input" value={filters.sortBy} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}>
              <option value="createdAt">Sort: Created</option>
              <option value="updatedAt">Sort: Updated</option>
              <option value="name">Sort: Name</option>
              <option value="stockQuantity">Sort: Stock</option>
              <option value="sellingPrice">Sort: Price</option>
            </select>
            <select className="input" value={filters.sortOrder} onChange={(event) => setFilters({ ...filters, sortOrder: event.target.value })}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <Button
              variant="ghost"
              onClick={() => {
                const next = {
                  search: '',
                  status: '',
                  minPrice: '',
                  maxPrice: '',
                  minStock: '',
                  maxStock: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                };
                setFilters(next);
                fetchProducts(next);
              }}
            >
              Reset filters
            </Button>
          </div>

          {loading ? (
            <div className="empty-table">Loading products...</div>
          ) : products.length ? (
            <DataTable columns={columns} rows={products} />
          ) : (
            <EmptyState title="No products found" description="Create your first product to populate the inventory." actionLabel="New product" onAction={openCreate} />
          )}
          <p className="table-footnote">Total results: {meta.total || 0}</p>
        </CardBody>
      </Card>

      <Modal
        open={editorOpen}
        title={editingProduct ? 'Edit product' : 'New product'}
        description="Provide the details required by the backend schema."
        onClose={() => setEditorOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitProduct} disabled={saving}>
              {saving ? 'Saving...' : 'Save product'}
            </Button>
          </>
        }
      >
        <div className="form-grid two-columns">
          <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input label="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
          <Input label="Barcode" value={form.barcode} onChange={(event) => setForm({ ...form, barcode: event.target.value })} />
          <Input label="Category ID" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} />
          <Input label="Buying price" type="number" step="0.01" value={form.buyingPrice} onChange={(event) => setForm({ ...form, buyingPrice: event.target.value })} />
          <Input label="Selling price" type="number" step="0.01" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} />
          <Input label="Discount %" type="number" step="0.01" value={form.discountPercent} onChange={(event) => setForm({ ...form, discountPercent: event.target.value })} />
          <Input label="Initial stock" type="number" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} />
          <Input label="Minimum stock" type="number" value={form.minimumStock} onChange={(event) => setForm({ ...form, minimumStock: event.target.value })} />
          <Input label="Image URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        </div>
        <Textarea label="Description" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      </Modal>

      <Modal
        open={stockOpen}
        title={`Adjust stock - ${activeStockProduct?.name || ''}`}
        description="Use positive numbers to add stock and negative numbers to reduce it."
        onClose={() => setStockOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStockOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitStock} disabled={saving}>
              {saving ? 'Updating...' : 'Apply change'}
            </Button>
          </>
        }
      >
        <div className="form-grid">
          <Input label="Change amount" type="number" value={stockForm.changeAmount} onChange={(event) => setStockForm({ ...stockForm, changeAmount: event.target.value })} />
          <Input label="Reason" value={stockForm.reason} onChange={(event) => setStockForm({ ...stockForm, reason: event.target.value })} placeholder="Restock / damage / correction" />
        </div>
      </Modal>
    </div>
  );
}
