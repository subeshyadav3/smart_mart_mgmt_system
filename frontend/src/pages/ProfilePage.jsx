import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import GuardedMessage from '../components/layout/GuardedMessage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateCurrentUser } from '../services/auth';
import { formatDateTime, formatNumber, formatCurrency } from '../utils/formatters';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const isMember = user?.type === 'MEMBER';

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', email: '', password: '' });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user]);

  if (!user) return <GuardedMessage title="Session Expired" description="Please log in to view your profile." />;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { fullName: form.fullName, phoneNumber: form.phoneNumber };
      if (user.type === 'STAFF') payload.email = form.email;
      if (form.password) payload.password = form.password;

      await updateCurrentUser(payload);
      await refreshUser();
      showToast('Profile updated successfully');
      setForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <Card>
        <CardHeader 
          title="Your Account" 
          subtitle="Manage your personal information and security."
          actions={<Badge tone={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active Account' : 'Inactive'}</Badge>}
        />
        <CardBody className="flex flex-col gap-8">
          {isMember && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase font-semibold">Member ID</span><span className="font-mono">{user.membershipId}</span></div>
              <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase font-semibold">Points</span><span>{formatNumber(user.loyaltyPoints)}</span></div>
              <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase font-semibold">Lifetime Spend</span><span>{formatCurrency(user.totalSpent)}</span></div>
              <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase font-semibold">Member Since</span><span>{formatDateTime(user.createdAt)}</span></div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
            <Input label="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({...form, phoneNumber: e.target.value})} />
            {user.type === 'STAFF' && (
              <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            )}
            <Input 
              label="Change Password" 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              hint="Only fill this if you want to change your current password."
            />
            <div className="md:col-span-2 pt-4 border-t border-slate-100">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}