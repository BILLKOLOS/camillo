import styled from 'styled-components';
import { theme, animations } from './theme';

export const AppWrapper = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: ${theme.gradients.primary};
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
`;

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

export const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  animation: ${animations.slideInDown} 0.8s ease-out;
`;

export const Logo = styled.div`
  width: 80px;
  height: 80px;
  background: ${theme.gradients.accent};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: ${theme.shadows.light};
`;

export const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: ${theme.colors.white};
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  margin: 0 0 10px 0;
`;

export const Subtitle = styled.p`
  color: ${theme.colors.whiteTransparent};
  font-size: 1.2rem;
  margin: 0 0 30px 0;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 40px 0;
  animation: ${animations.slideInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatCard = styled.div`
  background: ${theme.colors.glass};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 20px;
  text-align: center;
  border: 1px solid ${theme.colors.glassBorder};
  color: ${theme.colors.white};
`;

export const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin: 40px 0;
  animation: ${animations.fadeInScale} 0.8s ease-out;
`;

export const FeatureCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 30px;
  position: relative;
  overflow: hidden;
  transition: ${theme.transition};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.gradients.accent};
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

export const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.gradients.accent};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: 700;
  margin-bottom: 20px;
`;

export const CardTitle = styled.h3`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
  margin: 0 0 15px 0;
`;

export const CardText = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

export const HighlightText = styled.span`
  color: ${theme.colors.highlight};
  font-weight: 600;
`;

export const Button = styled.button`
  background: ${theme.gradients.accent};
  color: ${theme.colors.white};
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};
  box-shadow: 0 8px 25px rgba(255,107,107,0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(255,107,107,0.5);
  }
`;

export const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 25px;
  font-size: 0.95rem;
  background: ${theme.colors.glass};
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.glassBorder};
  box-shadow: none;

  &:hover {
    background: rgba(255,255,255,0.2);
    box-shadow: none;
  }
`; 