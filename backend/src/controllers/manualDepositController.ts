import { Request, Response } from 'express';
import ManualDepositRequest from '../models/ManualDepositRequest';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Create a new manual deposit request (user action)
export const createManualDepositRequest = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Creating manual deposit request...');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { amount } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({ message: 'Invalid amount provided' });
    }
    
    console.log('Creating manual deposit request for user:', userId, 'amount:', amount);
    
    const request = await ManualDepositRequest.create({ user: userId, amount, status: 'pending' });
    
    console.log('Manual deposit request created successfully:', request);
    
    res.status(201).json({ data: { request } });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error('Error creating manual deposit request:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Failed to create manual deposit request', 
      error: error.message 
    });
  }
};

// List all manual deposit requests (admin action)
export const getAllManualDepositRequests = async (req: Request, res: Response) => {
  try {
    const requests = await ManualDepositRequest.find().populate('user', 'name email phone');
    res.json({ data: { requests } });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error('Error getting manual deposit requests:', error);
    res.status(500).json({ message: 'Failed to get manual deposit requests' });
  }
};

// Approve a manual deposit request (admin action)
export const approveManualDepositRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = await ManualDepositRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    // Update user balance
    const user = await User.findById(request.user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.balance += request.amount;
    await user.save();
    // Update request status
    request.status = 'approved';
    await request.save();
    res.json({ data: { request, user } });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error('Error approving manual deposit request:', error);
    res.status(500).json({ message: 'Failed to approve manual deposit request' });
  }
};

// Reject a manual deposit request (admin action)
export const rejectManualDepositRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = await ManualDepositRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    request.status = 'rejected';
    await request.save();
    res.json({ data: { request } });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error('Error rejecting manual deposit request:', error);
    res.status(500).json({ message: 'Failed to reject manual deposit request' });
  }
}; 