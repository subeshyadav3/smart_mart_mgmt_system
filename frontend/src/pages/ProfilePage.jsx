import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import GuardedMessage from '../components/layout/GuardedMessage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateCurrentUser } from '../services/auth';
import { formatDateTime, formatNumber, formatCurrency } from '../utils/formatters';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const isMember = user?.type === 'MEMBER';
  const canEdit = Boolean(user);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', email: '', password: '' });

  useEffect(() => {
    setForm({
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      password: '',
    });
  }, [user]);

  if (!canEdit) {
    return <GuardedMessage title="Access denied" description="No active profile session was found." />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
      };

      if (user?.type === 'STAFF') {
        payload.email = form.email;
      }
      if (form.password) {
        payload.password = form.password;
      }

      await updateCurrentUser(payload);
      await refreshUser();
      showToast('Profile updated successfully');
      setForm((current) => ({ ...current, password: '' }));
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Profile"
          subtitle="Edit your own account information only."
          actions={<Badge tone={user?.isActive ? 'success' : 'danger'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge>}
        />
        <CardBody>
          {isMember ? (
            <div className="info-list" style={{ marginBottom: 16 }}>
              <div><span>Membership ID</span><strong>{user?.membershipId || '-'}</strong></div>
              <div><span>Loyalty points</span><strong>{formatNumber(user?.loyaltyPoints)}</strong></div>
              <div><span>Total spent</span><strong>{formatCurrency(user?.totalSpent)}</strong></div>
              <div><span>Joined</span><strong>{formatDateTime(user?.createdAt)}</strong></div>
            </div>
          ) : null}

          <form onSubmit={submit} className="form-grid two-columns">
            <Input label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            <Input label="Phone number" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            {user?.type === 'STAFF' ? (
              <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            ) : null}
            <Input label="New password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} hint="Leave blank to keep current password" />
            <div className="form-grid-actions">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
