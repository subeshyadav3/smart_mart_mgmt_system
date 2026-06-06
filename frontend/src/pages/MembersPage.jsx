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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) loadMembers();
    else setLoading(false);
  }, [canManage]);

  const openCreate = () => {
    setEditingMember(null);
    setForm(emptyMember);
    setEditorOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setForm({
      fullName: member.fullName || '',
      phoneNumber: member.phoneNumber || '',
      password: '',
    });
    setEditorOpen(true);
  };

  const columns = useMemo(
    () => [
      { key: 'fullName', label: 'Name' },
      { key: 'membershipId', label: 'Membership ID' },
      { key: 'phoneNumber', label: 'Phone' },
      { key: 'loyaltyPoints', label: 'Points' },
      { key: 'isActive', label: 'Status', render: (row) => <Badge tone={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
      { key: 'createdAt', label: 'Joined', render: (row) => formatDateTime(row.createdAt) },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="inline-actions">
            <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
            <Button variant="ghost" size="sm" onClick={() => toggleStatus(row)}>
              {row.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="danger" size="sm" onClick={() => removeMember(row)}>Delete</Button>
          </div>
        ),
      },
    ],
    [],
  );

  const toggleStatus = async (member) => {
    try {
      await updateMemberStatus(member.id, !member.isActive);
      showToast('Member status updated');
      await loadMembers();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const removeMember = async (member) => {
    if (!window.confirm(`Delete member ${member.fullName}?`)) return;
    try {
      await deleteMember(member.id);
      showToast('Member deleted');
      await loadMembers();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const submitMember = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingMember?.id) {
        const payload = {
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
        };
        if (form.password) payload.password = form.password;
        await updateMember(editingMember.id, payload);
        showToast('Member updated');
      } else {
        await createMember(form);
        showToast('Member created');
      }

      setForm(emptyMember);
      setEditorOpen(false);
      setEditingMember(null);
      await loadMembers();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return <GuardedMessage title="Access denied" description="Only staff and administrators can manage member records." />;
  }

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Members"
          subtitle="Create, edit, deactivate, and delete membership accounts."
          actions={<Button onClick={openCreate}>New member</Button>}
        />
        <CardBody>
          {loading ? (
            <div className="empty-table">Loading members...</div>
          ) : members.length ? (
            <DataTable columns={columns} rows={members} />
          ) : (
            <EmptyState title="No members found" description="Create a membership account to get started." actionLabel="New member" onAction={openCreate} />
          )}
        </CardBody>
      </Card>

      <Modal
        open={editorOpen}
        title={editingMember ? 'Edit member' : 'Create member'}
        description="For updates, password is optional (leave blank to keep existing)."
        onClose={() => setEditorOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={submitMember} disabled={saving}>{saving ? 'Saving...' : editingMember ? 'Update member' : 'Create member'}</Button>
          </>
        }
      >
        <div className="form-grid">
          <Input label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <Input label="Phone number" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
          <Input
            label={editingMember ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
