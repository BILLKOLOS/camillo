import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '../../services/singletonAuthService';
import {
  Container,
  Header,
  Logo,
  Title,
  Subtitle,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  CardsGrid,
  FeatureCard,
  StepNumber,
  CardTitle,
  CardText,
  HighlightText,
  Button
} from '../../styles/components';
import { theme, animations } from '../../styles/theme';
import { User } from '../../types';

// New styled components
const HeroSection = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius};
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="rgba(255,255,255,0.1)"/></svg>');
    opacity: 0.1;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: ${theme.colors.white};
  margin: 0 0 20px 0;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  animation: ${animations.slideInDown} 0.8s ease-out;
`;

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  color: ${theme.colors.whiteTransparent};
  margin: 0 0 40px 0;
  animation: ${animations.slideInUp} 0.8s ease-out;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 30px;
  animation: ${animations.fadeInScale} 0.8s ease-out;
`;

const EnhancedStatCard = styled(StatCard)`
  background: ${theme.colors.glass};
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.glassBorder};
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

const EnhancedFeatureCard = styled(FeatureCard)`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.glassBorder};
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

interface HomeProps {
  authService: typeof authService;
}

export const Home: React.FC<HomeProps> = ({ authService }) => {
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

  return (
    <Container>
      <HeroSection>
        <HeroContent>
          <Logo>💎</Logo>
          <HeroTitle>Camillo Investments</HeroTitle>
          <HeroSubtitle>Smart Investment Platform with MPESA Integration</HeroSubtitle>
          {!currentUser && !loading && (
            <ActionButtons>
              <Button as={Link} to="/auth/register">
                Create Account
              </Button>
              <Button as={Link} to="/auth/login" style={{ background: 'rgba(255,255,255,0.2)', color: theme.colors.white }}>
                Login
              </Button>
            </ActionButtons>
          )}
        </HeroContent>
      </HeroSection>

      <StatsGrid>
        <EnhancedStatCard>
          <StatValue>60%</StatValue>
          <StatLabel>Profit Returns</StatLabel>
        </EnhancedStatCard>
        <EnhancedStatCard>
          <StatValue>1 Hour</StatValue>
          <StatLabel>Fast Returns</StatLabel>
        </EnhancedStatCard>
        <EnhancedStatCard>
          <StatValue>24/7</StatValue>
          <StatLabel>Available</StatLabel>
        </EnhancedStatCard>
        <EnhancedStatCard>
          <StatValue>KES 1,000</StatValue>
          <StatLabel>Min Investment</StatLabel>
        </EnhancedStatCard>
      </StatsGrid>

      <CardsGrid>
        <EnhancedFeatureCard>
          <StepNumber>1</StepNumber>
          <CardTitle>Create Account</CardTitle>
          <CardText>
            Quick and secure registration with <HighlightText>phone verification</HighlightText>. 
            Seamless onboarding process with MPESA wallet integration for instant transactions. 
            Get started in under 2 minutes with real-time account validation.
          </CardText>
        </EnhancedFeatureCard>

        <EnhancedFeatureCard>
          <StepNumber>2</StepNumber>
          <CardTitle>Deposit Money</CardTitle>
          <CardText>
            Secure deposits via MPESA starting from <HighlightText>KES 1,000</HighlightText>. 
            Instant transaction processing with real-time balance updates. 
            Zero hidden fees with transparent transaction costs.
          </CardText>
        </EnhancedFeatureCard>

        <EnhancedFeatureCard>
          <StepNumber>3</StepNumber>
          <CardTitle>Make Investment</CardTitle>
          <CardText>
            Choose your investment amount and confirm. Automated processing with 
            <HighlightText> 60% guaranteed returns</HighlightText>. Real-time tracking with 
            push notifications for all investment activities.
          </CardText>
        </EnhancedFeatureCard>

        <EnhancedFeatureCard>
          <StepNumber>4</StepNumber>
          <CardTitle>Withdraw Profits</CardTitle>
          <CardText>
            Instant profit withdrawals to your MPESA wallet. Secure and reliable 
            transaction processing. Track your investment performance and returns in real-time.
          </CardText>
        </EnhancedFeatureCard>
      </CardsGrid>
    </Container>
  );
}; 