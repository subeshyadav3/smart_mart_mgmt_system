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
  const isAdmin = user?.role === 'ADMIN';

  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState(emptyStaff);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await listStaffs();
      setStaffList(res?.data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadStaff();
    else setLoading(false);
  }, [isAdmin]);

  const handleToggleRole = async (staff) => {
    const nextRole = staff.role === 'ADMIN' ? 'STAFF' : 'ADMIN';
    try {
      await updateStaffRole(staff.id, nextRole);
      showToast(`Role updated to ${nextRole}`);
      await loadStaff();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleToggleStatus = async (staff) => {
    try {
      await updateStaffStatus(staff.id, !staff.isActive);
      showToast('Staff status updated');
      await loadStaff();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleRemove = async (staff) => {
    if (staff.id === user.id) return showToast("You cannot delete your own account.", 'warning');
    if (!window.confirm(`Delete staff member ${staff.fullName}?`)) return;
    try {
      await deleteStaff(staff.id);
      showToast('Staff member removed');
      await loadStaff();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const columns = useMemo(() => [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge tone={row.role === 'ADMIN' ? 'violet' : 'blue'}>{row.role}</Badge> },
    { key: 'isActive', label: 'Status', render: (row) => <Badge tone={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { setEditingStaff(row); setForm({ ...row, password: '' }); setEditorOpen(true); }}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleRole(row)}>Switch Role</Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row)}>{row.isActive ? 'Suspend' : 'Activate'}</Button>
          <Button variant="danger" size="sm" onClick={() => handleRemove(row)}>Delete</Button>
        </div>
      ),
    },
  ], [user.id]);

  if (!isAdmin) return <GuardedMessage title="Administrator Only" description="You do not have permission to manage the workforce." />;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Workforce Management" subtitle="Control staff access and administrative privileges." actions={<Button onClick={() => { setEditingStaff(null); setForm(emptyStaff); setEditorOpen(true); }}>Add Staff</Button>} />
        <CardBody className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading workforce data...</div>
          ) : staffList.length ? (
            <DataTable columns={columns} rows={staffList} />
          ) : (
            <div className="p-6">
              <EmptyState title="Team is empty" description="Add your first staff member to get started." onAction={() => setEditorOpen(true)} />
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={editorOpen}
        title={editingStaff ? 'Update Staff Member' : 'Add New Staff'}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              setSaving(true);
              try {
                if (editingStaff) await updateStaff(editingStaff.id, form);
                else await createStaff(form);
                showToast(editingStaff ? 'Updated' : 'Created');
                setEditorOpen(false);
                await loadStaff();
              } catch (e) { showToast(e.message, 'danger'); }
              finally { setSaving(false); }
            }} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <Input label="Phone Number" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
          <Select label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrator</option>
          </Select>
          <div className="md:col-span-2">
            <Input label={editingStaff ? "New Password (Optional)" : "Initial Password"} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
        </div>
      </Modal>
    </div>
  );
}