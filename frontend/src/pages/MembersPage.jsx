import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import GuardedMessage from '../components/layout/GuardedMessage';
import { createMember, deleteMember, listMembers, updateMember, updateMemberStatus } from '../services/auth';
import { formatDateTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const emptyMember = { fullName: '', phoneNumber: '', password: '' };

export default function MembersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canManage = ['ADMIN', 'STAFF'].includes(user?.role);

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(emptyMember);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await listMembers();
      setMembers(response?.data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) loadMembers();
    else setLoading(false);
  }, [canManage]);

  const toggleStatus = async (member) => {
    try {
      await updateMemberStatus(member.id, !member.isActive);
      showToast(`Member ${member.isActive ? 'deactivated' : 'activated'} successfully`);
      await loadMembers();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const removeMember = async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.fullName}?`)) return;
    try {
      await deleteMember(member.id);
      showToast('Member deleted permanently');
      await loadMembers();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const submitMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMember?.id) {
        const payload = { fullName: form.fullName, phoneNumber: form.phoneNumber };
        if (form.password) payload.password = form.password;
        await updateMember(editingMember.id, payload);
        showToast('Member details updated');
      } else {
        await createMember(form);
        showToast('New member registered');
      }
      setEditorOpen(false);
      await loadMembers();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => [
    { key: 'fullName', label: 'Name' },
    { key: 'membershipId', label: 'ID', render: (row) => <code className="text-xs font-mono">{row.membershipId}</code> },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'loyaltyPoints', label: 'Points', render: (row) => row.loyaltyPoints?.toLocaleString() || 0 },
    { key: 'isActive', label: 'Status', render: (row) => <Badge tone={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => { setEditingMember(row); setForm({ ...row, password: '' }); setEditorOpen(true); }}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => toggleStatus(row)}>{row.isActive ? 'Deactivate' : 'Activate'}</Button>
          <Button variant="danger" size="sm" onClick={() => removeMember(row)}>Delete</Button>
        </div>
      ),
    },
  ], []);

  if (!canManage) return <GuardedMessage title="Access denied" description="Only staff and administrators can manage member records." />;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader 
          title="Members" 
          subtitle="Manage loyalty members and customer accounts." 
          actions={<Button onClick={() => { setEditingMember(null); setForm(emptyMember); setEditorOpen(true); }}>New Member</Button>} 
        />
        <CardBody className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading directory...</div>
          ) : members.length ? (
            <DataTable columns={columns} rows={members} />
          ) : (
            <div className="p-6">
              <EmptyState title="No members" description="Start by adding your first customer." actionLabel="New Member" onAction={() => setEditorOpen(true)} />
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={editorOpen}
        title={editingMember ? 'Edit Member' : 'Register Member'}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={submitMember} disabled={saving}>{saving ? 'Saving...' : 'Confirm'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required />
          <Input label="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({...form, phoneNumber: e.target.value})} required />
          <Input 
            label={editingMember ? "New Password (Optional)" : "Password"} 
            type="password" 
            value={form.password} 
            onChange={(e) => setForm({...form, password: e.target.value})} 
          />
        </div>
      </Modal>
    </div>
  );
}