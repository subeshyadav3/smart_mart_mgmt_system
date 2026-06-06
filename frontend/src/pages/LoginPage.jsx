import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const featureList = [
  'Inventory and pricing control',
  'Fast checkout and bill tracking',
  'Role-aware workforce management',
  'Member accounts and loyalty records',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState('staff');
  const [view, setView] = useState('login');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', membershipId: '', password: '', fullName: '', phoneNumber: '' });

  const title = useMemo(() => {
    if (mode === 'member' && view === 'register') return 'Create member account';
    if (mode === 'member') return 'Member sign in';
    return 'Staff sign in';
  }, [mode, view]);

  if (loading) {
    return <div className="center-screen">Loading secure session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');

    try {
      if (mode === 'member' && view === 'register') {
        const created = await register({
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          password: form.password,
        });
        showToast(`Member created: ${created?.membershipId || 'successfully'}`);
        setMode('member');
        setView('login');
        setForm((current) => ({ ...current, membershipId: created?.membershipId || '', password: '', fullName: '', phoneNumber: '' }));
        return;
      }

      const payload =
        mode === 'member'
          ? { membershipId: form.membershipId, password: form.password }
          : { email: form.email, password: form.password };

      await login({ mode, values: payload });
      showToast('Welcome back!');
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="brand-lockup">
          <div className="brand-mark large">SM</div>
          <p className="eyebrow">Retail operations suite</p>
          <h1>Smart Mart Management System</h1>
          <p className="hero-copy">
            A clean, scalable control center for inventory, billing, staff access, and member management.
          </p>
        </div>

        <div className="feature-grid">
          {featureList.map((item) => (
            <div key={item} className="feature-pill">
              <span>✓</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="auth-card">
        <div className="auth-tabs">
          <button className={mode === 'staff' ? 'tab active' : 'tab'} onClick={() => setMode('staff')} type="button">
            Staff
          </button>
          <button className={mode === 'member' ? 'tab active' : 'tab'} onClick={() => setMode('member')} type="button">
            Member
          </button>
        </div>

        <div className="auth-header">
          <h2>{title}</h2>
          <p>
            {mode === 'member' && view === 'register'
              ? 'Create a new membership account.'
              : 'Use your secure account to continue.'}
          </p>
        </div>

        {mode === 'member' ? (
          <div className="switch-row">
            <button type="button" className={view === 'login' ? 'switch active' : 'switch'} onClick={() => setView('login')}>
              Login
            </button>
            <button type="button" className={view === 'register' ? 'switch active' : 'switch'} onClick={() => setView('register')}>
              Register
            </button>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'staff' ? (
            <Input label="Email" type="email" value={form.email} onChange={updateField('email')} placeholder="admin@smartmart.com" required />
          ) : view === 'login' ? (
            <Input
              label="Membership ID"
              value={form.membershipId}
              onChange={updateField('membershipId')}
              placeholder="MEM-..."
              required
            />
          ) : (
            <>
              <Input label="Full name" value={form.fullName} onChange={updateField('fullName')} placeholder="John Doe" required />
              <Input label="Phone number" value={form.phoneNumber} onChange={updateField('phoneNumber')} placeholder="9800000000" required />
            </>
          )}

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
            placeholder="••••••••"
            required
          />

          {error ? <p className="form-error">{error}</p> : null}

          <Button type="submit" className="full-width" disabled={pending}>
            {pending ? 'Please wait...' : mode === 'member' && view === 'register' ? 'Create account' : 'Continue'}
          </Button>
        </form>

        <p className="auth-note">
          Backend API base URL is read from <strong>VITE_API_URL</strong>.
        </p>
      </Card>
    </div>
  );
}
