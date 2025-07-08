import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';
import { theme } from '../../styles/theme';
import { authService } from '../../services/singletonAuthService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = styled.form`
  max-width: 400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.shadows.light};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${theme.colors.textPrimary};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  transition: ${theme.transition};

  &:focus {
    border-color: ${theme.colors.highlight};
    outline: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin: 10px 0;
  font-size: 0.9rem;
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting login process...');
      const user = await authService.login(form.email, form.password);
      console.log('Login successful, user:', user);
      console.log('User role:', user.role);
      console.log('User ID:', user.id);
      
      // Verify the user data is correct
      if (!user || !user.role) {
        throw new Error('Invalid user data received');
      }
      
      // Verify authentication state
      const isAuthenticated = authService.isAuthenticated();
      console.log('Authentication state after login:', isAuthenticated);
      
      // Verify the token is properly stored
      const storedToken = localStorage.getItem('token');
      console.log('Stored token:', storedToken ? 'exists' : 'null');
      
      // Show success toast
      toast.success('Login successful!');
      
      // Small delay to ensure authentication state is properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate based on user role
      if (user.role === 'admin') {
        console.log('Redirecting to admin dashboard...');
        navigate('/admin', { replace: true });
      } else {
        console.log('Redirecting to user dashboard...');
        navigate('/dashboard', { replace: true });
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unknown error occurred.');
      toast.error(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Login</Title>
        <Subtitle>Access your dashboard</Subtitle>
      </Header>
      <LoginForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
        </FormGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </LoginForm>
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Container>
  );
};

export default LoginPage; 