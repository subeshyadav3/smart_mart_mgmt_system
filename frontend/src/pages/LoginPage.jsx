import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const featureList = [
  { title: 'Smart Inventory', desc: 'Real-time pricing & stock control over unified retail channels.' },
  { title: 'Express POS Checkout', desc: 'Instant itemized billing transactions and rapid queue handling.' },
  { title: 'Workforce Hub', desc: 'Granular, role-aware management configurations for staff shifts.' },
  { title: 'Loyalty Engine', desc: 'Automated member profiles tracking comprehensive point history.' },
];

const memberTestCredentials = { membershipId: 'MBR-TEST-0001', password: 'Member@123' };

const getInitialForm = (currentMode = 'member', currentView = 'login') => ({
  email: '',
  membershipId: currentMode === 'member' && currentView === 'login' ? memberTestCredentials.membershipId : '',
  password: currentMode === 'member' && currentView === 'login' ? memberTestCredentials.password : '',
  fullName: '',
  phoneNumber: '',
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState('member'); // 'staff' | 'member'
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => getInitialForm('member', 'login'));

  useEffect(() => {
    setError('');
    setForm(getInitialForm(mode, view));
  }, [mode, view]);

  const headerMeta = useMemo(() => {
    if (mode === 'member' && view === 'register') {
      return { title: 'Create member account', subtitle: 'Register a new account profile to track sales rewards.' };
    }
    if (mode === 'member') {
      return { title: 'Member Dashboard', subtitle: 'Access your exclusive customer pricing matrix and rewards ledger.' };
    }
    return { title: 'Staff Central Terminal', subtitle: 'Provide authorization passes to access restricted store processes.' };
  }, [mode, view]);

  if (loading) {
    return (
      <div className="center-screen flex flex-col gap-4 items-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide">Initializing secure operational node...</p>
      </div>
    );
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
        
        showToast(`Account successfully forged! ID: ${created?.membershipId || 'Success'}`);
        setMode('member');
        setView('login');
        setForm({ ...getInitialForm('member', 'login'), membershipId: created?.membershipId || '' });
        return;
      }

      const payload = mode === 'member'
        ? { membershipId: form.membershipId, password: form.password }
        : { email: form.email, password: form.password };

      await login({ mode, values: payload });
      showToast('Authentication cleared. Welcome.');
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'System failed to validate parameters. Check credentials.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen bg-slate-50/50 lg:p-8 xl:p-12">
      {/* Visual Presentation Context Block */}
      <div className="auth-visual hidden lg:flex flex-col justify-between h-full p-10 bg-slate-900 text-white rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_45%)] pointer-events-none" />
        
        <div className="brand-lockup relative z-10">
          <div className="brand-mark large bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 font-black tracking-tight" aria-hidden="true">
            SM
          </div>
          <p className="eyebrow text-blue-400 font-bold tracking-widest text-[10px]">RETAIL OPERATIONS PLATFORM</p>
          <h1 className="text-4xl font-extrabold tracking-tight mt-2 text-white">Smart Mart Core</h1>
          <p className="hero-copy text-slate-400 mt-4 leading-relaxed max-w-md">
            Unifying supply management workflows, high-throughput register logs, and customer conversion pipelines under a single administrative cloud layout.
          </p>
        </div>

        <div className="feature-grid grid grid-cols-1 xl:grid-cols-2 gap-4 mt-12 relative z-10">
          {featureList.map((item) => (
            <div key={item.title} className="group p-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl transition-all duration-300 hover:bg-slate-800/70 hover:border-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-500 mt-8 relative z-10">
          © 2026 Smart Mart Systems Inc. Operational Environment v4.1.0-prod
        </div>
      </div>

      {/* Access Panel / Interaction Surface */}
      <div className="flex justify-center items-center w-full px-4 py-8 lg:p-0">
        <Card className="auth-card w-full max-w-lg p-8 sm:p-10 bg-white shadow-xl shadow-slate-100 border border-slate-200/60 rounded-[2rem] transition-all">
          
          {/* Segment Toggle Axis */}
          <div className="auth-tabs p-1 bg-slate-100 rounded-2xl flex gap-1 mb-8">
            <button 
              className={`tab flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-xl ${mode === 'staff' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`} 
              onClick={() => { setMode('staff'); setView('login'); }} 
              type="button"
            >
              Staff Account
            </button>
            <button 
              className={`tab flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-xl ${mode === 'member' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`} 
              onClick={() => setMode('member')} 
              type="button"
            >
              Member Program
            </button>
          </div>

          {/* Heading Context Elements */}
          <div className="auth-header mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{headerMeta.title}</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{headerMeta.subtitle}</p>
          </div>

          {/* Form Context Sub-Axis Selection */}
          {mode === 'member' && (
            <div className="switch-row flex p-1 bg-slate-100/70 border border-slate-200/40 rounded-xl max-w-[200px] gap-1 mb-6">
              <button 
                type="button" 
                className={`switch flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${view === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`} 
                onClick={() => setView('login')}
              >
                Sign In
              </button>
              <button 
                type="button" 
                className={`switch flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${view === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`} 
                onClick={() => setView('register')}
              >
                Join
              </button>
            </div>
          )}

          {/* Core Interactive Input Forms Block */}
          <form className="auth-form flex flex-col gap-5" onSubmit={handleSubmit}>
            {mode === 'staff' ? (
              <Input 
                label="Corporate Email Address" 
                type="email" 
                value={form.email} 
                onChange={updateField('email')} 
                placeholder="identity@company.com" 
                required 
              />
            ) : view === 'login' ? (
              <Input
                label="System Membership ID"
                value={form.membershipId}
                onChange={updateField('membershipId')}
                placeholder="MEM-000000"
                required
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Legal Full Name" 
                  value={form.fullName} 
                  onChange={updateField('fullName')} 
                  placeholder="Taylor Vance" 
                  required 
                />
                <Input 
                  label="Mobile Contact Line" 
                  value={form.phoneNumber} 
                  onChange={updateField('phoneNumber')} 
                  placeholder="98XXXXXXXX" 
                  required 
                />
              </div>
            )}

            <Input
              label="Account Password Access Phrase"
              type="password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="••••••••••••"
              required
            />

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 mt-1" role="alert">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs font-semibold leading-normal">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="full-width py-3.5 mt-2 font-semibold text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-blue-600/10" 
              disabled={pending}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Parameters...
                </span>
              ) : mode === 'member' && view === 'register' ? (
                'Finalize Membership Enrollment'
              ) : (
                'Request Platform Clearence'
              )}
            </Button>
          </form>

          {/* Environmental Target Indicator Metadata Footer */}
          <div className="text-center mt-8 pt-5 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-[11px] font-medium text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Transport Node Enabled
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}