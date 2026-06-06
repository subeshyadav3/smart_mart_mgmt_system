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
import { createStaff, deleteStaff, listStaffs, updateStaff, updateStaffRole, updateStaffStatus } from '../services/workforce';
import { formatDateTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const emptyStaff = { fullName: '', email: '', password: '', phoneNumber: '', role: 'STAFF', isActive: true };

export default function WorkforcePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canManage = user?.role === 'ADMIN';
  const [loading, setLoading] = useState(true);
  const [staffs, setStaffs] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState(emptyStaff);

  const loadStaffs = async () => {
    setLoading(true);
    try {
      const response = await listStaffs();
      setStaffs(response?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) loadStaffs();
    else setLoading(false);
  }, [canManage]);

  const openCreate = () => {
    setEditingStaff(null);
    setForm(emptyStaff);
    setEditorOpen(true);
  };

  const openEdit = (staff) => {
    setEditingStaff(staff);
    setForm({
      fullName: staff.fullName || '',
      email: staff.email || '',
      password: '',
      phoneNumber: staff.phoneNumber || '',
      role: staff.role || 'STAFF',
      isActive: Boolean(staff.isActive),
    });
    setEditorOpen(true);
  };

  const columns = useMemo(
    () => [
      { key: 'fullName', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (row) => <Badge tone={row.role === 'ADMIN' ? 'violet' : 'blue'}>{row.role}</Badge> },
      { key: 'isActive', label: 'Status', render: (row) => <Badge tone={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
      { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="inline-actions">
            <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
            <Button variant="ghost" size="sm" onClick={() => toggleRole(row)}>Role</Button>
            <Button variant="ghost" size="sm" onClick={() => toggleStatus(row)}>
              {row.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="danger" size="sm" onClick={() => removeStaff(row)}>Delete</Button>
          </div>
        ),
      },
    ],
    [],
  );

  const toggleRole = async (staff) => {
    const nextRole = staff.role === 'ADMIN' ? 'STAFF' : 'ADMIN';
    try {
      await updateStaffRole(staff.id, nextRole);
      showToast(`Role updated to ${nextRole}`);
      await loadStaffs();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const toggleStatus = async (staff) => {
    try {
      await updateStaffStatus(staff.id, !staff.isActive);
      showToast('Staff status updated');
      await loadStaffs();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const removeStaff = async (staff) => {
    if (!window.confirm(`Delete staff ${staff.fullName}?`)) return;
    try {
      await deleteStaff(staff.id);
      showToast('Staff deleted');
      await loadStaffs();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const submitStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingStaff?.id) {
        const payload = {
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          role: form.role,
          isActive: form.isActive,
        };
        if (form.password) payload.password = form.password;
        await updateStaff(editingStaff.id, payload);
        showToast('Staff updated');
      } else {
        await createStaff(form);
        showToast('Staff created');
      }

      setForm(emptyStaff);
      setEditingStaff(null);
      setEditorOpen(false);
      await loadStaffs();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return <GuardedMessage title="Access denied" description="Only administrators can access workforce management." />;
  }

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Workforce"
          subtitle="Create, edit, activate/deactivate, and delete staff accounts."
          actions={<Button onClick={openCreate}>New staff</Button>}
        />
        <CardBody>
          {loading ? (
            <div className="empty-table">Loading staff...</div>
          ) : staffs.length ? (
            <DataTable columns={columns} rows={staffs} />
          ) : (
            <EmptyState title="No staff found" description="Add a new staff account to begin workforce management." actionLabel="New staff" onAction={openCreate} />
          )}
        </CardBody>
      </Card>

      <Modal
        open={editorOpen}
        title={editingStaff ? 'Edit staff' : 'Create staff'}
        description="For updates, password is optional (leave blank to keep existing)."
        onClose={() => setEditorOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={submitStaff} disabled={saving}>{saving ? 'Saving...' : editingStaff ? 'Update staff' : 'Create staff'}</Button>
          </>
        }
      >
        <div className="form-grid two-columns">
          <Input label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input label="Phone number" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
          <Select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="STAFF">STAFF</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <Input
            label={editingStaff ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
