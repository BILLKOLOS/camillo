import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';
import { API_BASE_URL } from '../../services/config';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');

    // Prepare data for backend
    const payload = {
      name: form.fullName,
      phone: form.phone,
      email: form.email,
      password: form.password,
      role: 'client'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Registration response:', data);
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return;
      }
      // Registration successful
      navigate('/auth/success');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Sign Up</Title>
        <Subtitle>Create your account to start investing</Subtitle>
      </Header>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <label>Full Name</label>
          <input
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>Safaricom Phone</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="07XXXXXXXX"
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <label>Password</label>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', userSelect: 'none' }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <div style={{ marginBottom: 30, position: 'relative' }}>
          <label>Confirm Password</label>
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <span
            onClick={() => setShowConfirmPassword((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', userSelect: 'none' }}
            title={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <Button type="submit" style={{ width: '100%' }}>Continue</Button>
      </form>
    </Container>
  );
};

export default RegisterPage; 