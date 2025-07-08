import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthService } from './services/authService';
import { InvestmentService } from './services/investmentService';

// Mock the services
jest.mock('./services/authService');
jest.mock('./services/investmentService');

describe('App', () => {
  it('renders the home page', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check for the main heading
    const headingElement = screen.getByText(/Welcome to Camillo Investments/i);
    expect(headingElement).toBeInTheDocument();
  });
});
