import { API_BASE_URL } from './config';

export const manualDepositService = {
  async createManualDepositRequest(amount: number) {
    const token = localStorage.getItem('token');
    console.log('Creating manual deposit request for amount:', amount);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Token exists:', !!token);
    
    const response = await fetch(`${API_BASE_URL}/manual-deposits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('Manual deposit request failed:', data);
      throw new Error(data.message || data.error || 'Failed to create manual deposit request');
    }
    return data.data.request;
  },
}; 