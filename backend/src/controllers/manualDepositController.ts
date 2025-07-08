import { Request, Response } from 'express';
import ManualDepositRequest from '../models/ManualDepositRequest';
import User from '../models/User';

// Create a new manual deposit request (user action)
export const createManualDepositRequest = async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const request = await ManualDepositRequest.create({ user: userId, amount, status: 'pending' });
    res.status(201).json({ data: { request } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create manual deposit request' });
  }
};

// List all manual deposit requests (admin action)
export const getAllManualDepositRequests = async (req: Request, res: Response) => {
  try {
    const requests = await ManualDepositRequest.find().populate('user', 'name email phone');
    res.json({ data: { requests } });
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject manual deposit request' });
  }
}; 