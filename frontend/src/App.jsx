import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import MembersPage from './pages/MembersPage';
import WorkforcePage from './pages/WorkforcePage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="center-screen">Loading secure workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ allow = [], children }) {
  const { user } = useAuth();

  if (!allow.length) return children;

  const allowed = allow.some((item) => item === user?.role || item === user?.type);
  if (!allowed) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<RoleRoute allow={['ADMIN', 'STAFF']}><ProductsPage /></RoleRoute>} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="members" element={<RoleRoute allow={['ADMIN', 'STAFF']}><MembersPage /></RoleRoute>} />
        <Route path="workforce" element={<RoleRoute allow={['ADMIN']}><WorkforcePage /></RoleRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
