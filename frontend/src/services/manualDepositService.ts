import { API_BASE_URL } from './config';

export const manualDepositService = {
  async createManualDepositRequest(amount: number) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/manual-deposits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create manual deposit request');
    }
    return data.data.request;
  },
}; 