import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user?.displayName} ({user?.email})</p>
      <p className="mt-2">Your role: <span className="font-semibold uppercase text-blue-600">{user?.role}</span></p>
      <button
        onClick={() => logout()}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

const Unauthorized = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
    <p className="mt-2">You do not have permission to view this page.</p>
    <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">Go Home</a>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['developer', 'coordinator']}>
            <div className="p-8">Admin Page (Coordinators & Developers only)</div>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
