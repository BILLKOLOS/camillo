// API configuration with environment support
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isDevelopment 
    ? 'http://localhost:5000/api'  // Local development
    : 'https://camillo-backend.onrender.com/api'  // Production
  );

// Log the current configuration
console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL); 