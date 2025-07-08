import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/singletonAuthService';
import { InvestmentService } from './services/investmentService';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home/Home';
import { Investments } from './pages/Investments/Investments';
import { AppWrapper } from './styles/components';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import './App.css';
import RegisterPage from './pages/Auth/RegisterPage';
import RegistrationSuccessPage from './pages/Auth/RegistrationSuccessPage';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import MPESABotAdminPage from './pages/Admin/MPESABotAdminPage';
import { User } from './types';

// Initialize services
const investmentService = new InvestmentService();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppWrapper>
        <Router>
          <Layout authService={authService}>
            <Routes>
              <Route path="/" element={<Home authService={authService} />} />
              <Route
                path="/investments"
                element={
                  <PrivateRoute key={authService.getToken() || 'no-token'} authService={authService}>
                    <Investments authService={authService} investmentService={investmentService} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute key={authService.getToken() || 'no-token'} authService={authService}>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/mpesa-bot"
                element={
                  <AdminRoute key={authService.getToken() || 'no-token'} authService={authService}>
                    <MPESABotAdminPage />
                  </AdminRoute>
                }
              />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/success" element={<RegistrationSuccessPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AppWrapper>
    </ThemeProvider>
  );
}

// Private route component for authenticated users
const PrivateRoute: React.FC<{
  children: React.ReactNode;
  authService: typeof authService;
}> = ({ children, authService }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [authService]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Admin route component for admin users only
const AdminRoute: React.FC<{
  children: React.ReactNode;
  authService: typeof authService;
}> = ({ children, authService }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
        setError('You must be logged in as an admin to access this page. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [authService]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
        {error}
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
        You do not have permission to access this page. Only admins are allowed.
      </div>
    );
  }

  return <>{children}</>;
};

export default App;
