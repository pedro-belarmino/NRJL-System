import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Home from './views/Home';
import Admin from './views/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './views/LoadingScreen';
import type { UserRole } from './service/authoriseEmailService';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, loading, isAuthorized, role } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAuthorized } = useAuth();

  if (loading) return <LoadingScreen />;

  // If user is already authenticated and authorized, go home
  if (user && isAuthorized) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['developer', 'coordinator']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
