import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';

export const createTransaction = async (req: any, res: Response) => {
  try {
    const { type, amount, mpesaTransactionId } = req.body;
    const userId = req.user.id;
    let status: 'pending' | 'completed' | 'failed' = 'completed';
    if (type === 'withdrawal') status = 'pending';
    const transaction = await Transaction.create({ userId, type, amount, status, userName: req.user.name, userPhone: req.user.phone });
    if (type === 'deposit') await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
    if (type === 'profit') await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
    res.status(201).json({ data: { transaction } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create transaction' });
  }
};

export const getUserTransactions = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    res.json({ data: { transactions } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get transactions' });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ data: { transactions } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get all transactions' });
  }
};

export const getTransactionStats = async (req: Request, res: Response) => {
  try {
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalProfits = await Transaction.aggregate([
      { $match: { type: 'profit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.json({ data: { stats: {
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalProfits: totalProfits[0]?.total || 0
    } } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get transaction stats' });
  }
};

export const getPendingWithdrawals = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ type: 'withdrawal', status: 'pending' })
      .populate('userId', 'name phone');
    res.json({ data: { transactions } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get pending withdrawals' });
  }
};

export const approveWithdrawal = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findByIdAndUpdate(transactionId, { status: 'completed' }, { new: true });
    if (transaction) {
      await User.findByIdAndUpdate(transaction.userId, { $inc: { balance: -transaction.amount } });
    }
    res.json({ data: { transaction } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve withdrawal' });
  }
};

export const createProfitTransaction = async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    const transaction = await Transaction.create({ 
      userId, 
      type: 'profit', 
      amount, 
      status: 'completed',
      userName: req.body.userName,
      userPhone: req.body.userPhone
    });
    
    // Update user balance
    await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
    
    res.status(201).json({ data: { transaction } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create profit transaction' });
  }
}; 