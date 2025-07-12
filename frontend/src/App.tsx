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

// Global loading component
const GlobalLoading: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    background: theme.gradients.primary,
    color: 'white'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
    <div style={{ fontSize: '1.2rem' }}>Loading Camillo Investments...</div>
    <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
      Recovering your session...
    </div>
  </div>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionRecovered, setSessionRecovered] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Camillo Investments app...');
        
        // Check if user has a token and try to recover session
        if (authService.isAuthenticated()) {
          console.log('🔍 Found existing token, attempting session recovery...');
          await authService.forceSessionRecovery();
          setSessionRecovered(true);
        }
        
        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ App initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
    return <GlobalLoading />;
  }

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

// Enhanced Private route component for authenticated users
const PrivateRoute: React.FC<{
  children: React.ReactNode;
  authService: typeof authService;
}> = ({ children, authService }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication for private route...');
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          console.log('✅ User authenticated:', user.name);
        } else {
          console.log('❌ User not authenticated');
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setCurrentUser(null);
        
        // Retry once if it's a network error
        if (retryCount < 1 && error instanceof Error && error.message.includes('fetch')) {
          console.log('🔄 Retrying authentication check...');
          setRetryCount(prev => prev + 1);
          setTimeout(() => checkAuth(), 2000);
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [authService, retryCount]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔐</div>
        <div>Verifying your session...</div>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Enhanced Admin route component for admin users only
const AdminRoute: React.FC<{
  children: React.ReactNode;
  authService: typeof authService;
}> = ({ children, authService }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication for admin route...');
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          console.log('✅ Admin user authenticated:', user.name);
        } else {
          console.log('❌ User not authenticated');
        }
      } catch (error) {
        console.error('❌ Admin auth check failed:', error);
        setCurrentUser(null);
        setError('You must be logged in as an admin to access this page. Please log in again.');
        
        // Retry once if it's a network error
        if (retryCount < 1 && error instanceof Error && error.message.includes('fetch')) {
          console.log('🔄 Retrying admin authentication check...');
          setRetryCount(prev => prev + 1);
          setTimeout(() => checkAuth(), 2000);
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [authService, retryCount]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>👑</div>
        <div>Verifying admin privileges...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: 'red', 
        textAlign: 'center', 
        marginTop: '2rem',
        padding: '2rem',
        background: '#fff3f3',
        borderRadius: '8px',
        border: '1px solid #ffcdd2'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚠️</div>
        {error}
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return (
      <div style={{ 
        color: 'red', 
        textAlign: 'center', 
        marginTop: '2rem',
        padding: '2rem',
        background: '#fff3f3',
        borderRadius: '8px',
        border: '1px solid #ffcdd2'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🚫</div>
        You do not have permission to access this page. Only admins are allowed.
      </div>
    );
  }

  return <>{children}</>;
};

export default App;
