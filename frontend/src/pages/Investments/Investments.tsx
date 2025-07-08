import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '../../services/singletonAuthService';
import { InvestmentService } from '../../services/investmentService';
import { Investment, User } from '../../types';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';
import { theme, animations } from '../../styles/theme';

// Styled components
const InvestmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin: 40px 0;
  animation: ${animations.fadeInScale} 0.8s ease-out;
`;

const InvestmentCard = styled.div`
  background: ${theme.colors.glass};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 30px;
  text-align: center;
  border: 1px solid ${theme.colors.glassBorder};
  color: ${theme.colors.white};
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

const InvestmentValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 10px 0;
  background: ${theme.gradients.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ActionCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 30px;
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
  margin: 0 0 20px 0;
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

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin: 10px 0;
  font-size: 0.9rem;
`;

const InvestmentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: rgba(255,255,255,0.95);
  border-radius: ${theme.borderRadius};
  overflow: hidden;
  box-shadow: ${theme.shadows.light};

  th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f6f6f6;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(0,0,0,0.02);
  }
`;

const StatusBadge = styled.span<{ status: 'pending' | 'active' | 'completed' | 'trading' }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${(props: { status: 'pending' | 'active' | 'completed' | 'trading' }) =>
    props.status === 'active'
      ? '#e3f2fd'
      : props.status === 'completed'
      ? '#e8f5e9'
      : props.status === 'trading'
      ? '#fff3e0'
      : '#fffde7'};
  color: ${(props: { status: 'pending' | 'active' | 'completed' | 'trading' }) =>
    props.status === 'active'
      ? '#1976d2'
      : props.status === 'completed'
      ? '#2e7d32'
      : props.status === 'trading'
      ? '#f57c00'
      : '#f9a825'};
`;

interface InvestmentsProps {
  authService: typeof authService;
  investmentService: InvestmentService;
}

export const Investments: React.FC<InvestmentsProps> = ({ authService, investmentService }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showInvest, setShowInvest] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        
        if (!user) {
          navigate('/login');
          return;
        }

        if (user.role === 'admin') {
          navigate('/admin');
          return;
        }

        // Fetch investments after auth check
        const investmentsData = await investmentService.getClientInvestments(user.id);
        setInvestments(investmentsData);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [authService, navigate, investmentService]);

  const handleInvest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      const investmentAmount = parseFloat(amount);
      if (isNaN(investmentAmount)) {
        setError('Please enter a valid amount');
        return;
      }

      const newInvestment = await investmentService.createInvestment(currentUser.id, investmentAmount);
      setInvestments([...investments, newInvestment]);
      setAmount('');
      setError('');
      setShowInvest(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + (inv.status === 'completed' ? inv.profitAmount : 0), 0);
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading...</h2>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Investments</Title>
        <Subtitle>Track and manage your investment portfolio</Subtitle>
      </Header>

      <InvestmentsGrid>
        <InvestmentCard>
          <h3>Total Invested</h3>
          <InvestmentValue>{totalInvested} KSH</InvestmentValue>
        </InvestmentCard>
        <InvestmentCard>
          <h3>Total Profit</h3>
          <InvestmentValue>{totalProfit} KSH</InvestmentValue>
        </InvestmentCard>
        <InvestmentCard>
          <h3>Active Investments</h3>
          <InvestmentValue>{activeInvestments}</InvestmentValue>
        </InvestmentCard>
      </InvestmentsGrid>

      <ActionCard>
        <ActionTitle>Make a New Investment</ActionTitle>
        <form onSubmit={handleInvest}>
          <Input
            type="number"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="Enter amount (min 1,000 KSH)"
            min={1000}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit">Confirm Investment</Button>
            <Button onClick={() => setShowInvest(false)} style={{ background: '#eee', color: '#333' }}>
              Cancel
            </Button>
          </div>
        </form>
      </ActionCard>

      <ActionCard style={{ marginTop: 30 }}>
        <ActionTitle>Investment History</ActionTitle>
        <InvestmentTable>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Profit</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(inv => (
              <tr key={inv.id}>
                <td>{inv.amount} KSH</td>
                <td>{inv.profitAmount} KSH</td>
                <td>
                  <StatusBadge status={inv.status}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </StatusBadge>
                </td>
                <td>{formatDate(inv.createdAt)}</td>
                <td>{inv.profitPaidAt ? formatDate(inv.profitPaidAt) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </InvestmentTable>
        {investments.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
            No investments yet. Start investing now!
          </div>
        )}
      </ActionCard>
    </Container>
  );
}; 