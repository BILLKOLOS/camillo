import { keyframes } from 'styled-components';

// CSS Variables as JS object for consistency
export const theme = {
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accent: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    success: 'linear-gradient(135deg, #00b894, #00a085)',
  },
  colors: {
    glass: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    textPrimary: '#2c3e50',
    textSecondary: '#5a6c7d',
    highlight: '#ff6b6b',
    white: '#ffffff',
    whiteTransparent: 'rgba(255, 255, 255, 0.9)',
    error: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#2980b9',
  },
  shadows: {
    light: '0 8px 32px rgba(0, 0, 0, 0.1)',
    medium: '0 12px 40px rgba(0, 0, 0, 0.12)',
    heavy: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
  borderRadius: '20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Keyframe animations
export const animations = {
  slideInDown: keyframes`
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  slideInUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  fadeInScale: keyframes`
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  `,
  pulse: keyframes`
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  `,
  ripple: keyframes`
    to {
      transform: scale(4);
      opacity: 0;
    }
  `
}; 