import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';
import { theme, animations } from '../../styles/theme';
import { mpesaBotService } from '../../services/mpesaBotService';

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
  margin: 40px 0;
  animation: ${animations.fadeInScale} 0.8s ease-out;
`;

const AdminCard = styled.div`
  background: ${theme.colors.glass};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 30px;
  border: 1px solid ${theme.colors.glassBorder};
  color: ${theme.colors.white};
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

const UserCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 20px;
  margin-bottom: 15px;
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 15px;
  transition: ${theme.transition};

  &:focus {
    border-color: ${theme.colors.highlight};
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 15px;
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

const SuccessMessage = styled.div`
  color: #2ecc71;
  margin: 10px 0;
  font-size: 0.9rem;
`;

const UserInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0;
`;

const UserLabel = styled.span`
  font-weight: 600;
  color: #333;
`;

const UserValue = styled.span`
  color: #666;
`;

const MPESABotAdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Simulation form state
  const [simulationForm, setSimulationForm] = useState({
    senderName: '',
    senderPhone: '',
    amount: ''
  });

  // Manual balance update state
  const [balanceUpdateForm, setBalanceUpdateForm] = useState({
    userId: '',
    amount: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await mpesaBotService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const result = await mpesaBotService.simulateNotification({
        senderName: simulationForm.senderName,
        senderPhone: simulationForm.senderPhone,
        amount: Number(simulationForm.amount)
      });

      if (result.success) {
        setSuccess(`Successfully processed notification: ${result.message}`);
        setSimulationForm({ senderName: '', senderPhone: '', amount: '' });
        loadUsers(); // Refresh user list
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to simulate notification');
      console.error('Error simulating notification:', error);
    }
  };

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const result = await mpesaBotService.updateUserBalance(
        balanceUpdateForm.userId,
        Number(balanceUpdateForm.amount)
      );

      setSuccess(`Successfully updated balance for ${result.name} to ${result.balance} KSH`);
      setBalanceUpdateForm({ userId: '', amount: '' });
      loadUsers(); // Refresh user list
    } catch (error) {
      setError('Failed to update balance');
      console.error('Error updating balance:', error);
    }
  };

  return (
    <Container>
      <Header>
        <Title>MPESA Bot Administration</Title>
        <Subtitle>Manage automated deposits and user balances</Subtitle>
      </Header>

      <AdminGrid>
        <AdminCard>
          <h3 style={{ marginBottom: 20, color: '#fff' }}>🤖 Simulate MPESA Notification</h3>
          <form onSubmit={handleSimulateNotification}>
            <Input
              type="text"
              placeholder="Sender Name (e.g., MARY ATIENO)"
              value={simulationForm.senderName}
              onChange={(e) => setSimulationForm({ ...simulationForm, senderName: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Sender Phone (e.g., 0722233390)"
              value={simulationForm.senderPhone}
              onChange={(e) => setSimulationForm({ ...simulationForm, senderPhone: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount (KSH)"
              value={simulationForm.amount}
              onChange={(e) => setSimulationForm({ ...simulationForm, amount: e.target.value })}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            <Button type="submit" style={{ width: '100%' }}>
              Simulate MPESA Notification
            </Button>
          </form>
        </AdminCard>

        <AdminCard>
          <h3 style={{ marginBottom: 20, color: '#fff' }}>💰 Manual Balance Update</h3>
          <form onSubmit={handleUpdateBalance}>
            <Select
              value={balanceUpdateForm.userId}
              onChange={(e) => setBalanceUpdateForm({ ...balanceUpdateForm, userId: e.target.value })}
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.phone}) - Current: {user.balance} KSH
                </option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Amount to add/subtract (use negative for subtraction)"
              value={balanceUpdateForm.amount}
              onChange={(e) => setBalanceUpdateForm({ ...balanceUpdateForm, amount: e.target.value })}
            />
            <Button type="submit" style={{ width: '100%' }}>
              Update Balance
            </Button>
          </form>
        </AdminCard>
      </AdminGrid>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ color: '#fff', marginBottom: 20 }}>👥 All Users</h2>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#fff' }}>Loading users...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {users.map(user => (
              <UserCard key={user.id}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>{user.name}</h4>
                <UserInfo>
                  <UserLabel>Phone:</UserLabel>
                  <UserValue>{user.phone}</UserValue>
                  <UserLabel>Email:</UserLabel>
                  <UserValue>{user.email}</UserValue>
                  <UserLabel>Balance:</UserLabel>
                  <UserValue style={{ color: '#2ecc71', fontWeight: 600 }}>{user.balance} KSH</UserValue>
                  <UserLabel>Role:</UserLabel>
                  <UserValue>{user.role}</UserValue>
                </UserInfo>
                <div style={{ marginTop: 10, fontSize: '0.9rem', color: '#888' }}>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </UserCard>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default MPESABotAdminPage; 