import { Request, Response } from 'express';
import Trade from '../models/Trade';

export const createTrade = async (req: any, res: Response) => {
  try {
    const { amount, profit } = req.body;
    const adminId = req.user.id;
    const trade = await Trade.create({ adminId, amount, profit, status: 'pending' });
    res.status(201).json({ data: { trade } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create trade' });
  }
};

export const getAllTrades = async (req: Request, res: Response) => {
  try {
    const trades = await Trade.find().sort({ createdAt: -1 });
    res.json({ data: { trades } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get trades' });
  }
};

export const completeTrade = async (req: Request, res: Response) => {
  try {
    const { tradeId } = req.params;
    const trade = await Trade.findByIdAndUpdate(tradeId, { status: 'completed', completedAt: new Date() }, { new: true });
    res.json({ data: { trade } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete trade' });
  }
}; 