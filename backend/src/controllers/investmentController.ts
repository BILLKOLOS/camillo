import { Request, Response } from 'express';
import Investment from '../models/Investment';
import User from '../models/User';

export const createInvestment = async (req: any, res: Response) => {
  try {
    const { amount, testMode } = req.body;
    const userId = req.user.id;
    
    // Get user details for tracking
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate expiry date (24 hours from now, or 1 minute for test mode)
    const expiryDate = testMode 
      ? new Date(Date.now() + 1 * 60 * 1000) // 1 minute for testing
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours normal
    
    const investment = await Investment.create({ 
      userId, 
      amount, 
      status: 'active', 
      paymentStatus: 'paid', 
      profitAmount: Math.round(amount * 0.6), 
      tradingPeriod: testMode ? 1 : 24,
      expiryDate,
      userName: user.name,
      userPhone: user.phone
    });
    
    await User.findByIdAndUpdate(userId, { $inc: { balance: -amount } });
    
    console.log(`✅ Investment created for user ${user.name}: ${amount} KSH, expires at ${expiryDate.toISOString()}`);
    
    res.status(201).json({ data: { investment } });
  } catch (err) {
    console.error('❌ Error creating investment:', err);
    res.status(500).json({ message: 'Failed to create investment' });
  }
};

export const getClientInvestments = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const investments = await Investment.find({ userId });
    res.json({ data: { investments } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get investments' });
  }
};

export const getAllInvestments = async (req: Request, res: Response) => {
  try {
    const investments = await Investment.find();
    res.json({ data: { investments } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get all investments' });
  }
};

export const getInvestmentsByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const user = await User.findOne({ phone });
    if (!user) return res.json({ data: { investments: [] } });
    const investments = await Investment.find({ userId: user._id });
    res.json({ data: { investments } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get investments by phone' });
  }
};

export const getCompletedPendingPayments = async (req: Request, res: Response) => {
  try {
    const investments = await Investment.find({ status: 'completed', paymentStatus: 'pending' });
    res.json({ data: { investments } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get completed pending payments' });
  }
};

export const getExpiredInvestments = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const investments = await Investment.find({ expiryDate: { $lte: now }, status: 'active' });
    res.json({ data: { investments } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get expired investments' });
  }
};

export const completeExpiredInvestments = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Find expired investments first
    const expiredInvestments = await Investment.find({ 
      expiryDate: { $lte: now }, 
      status: 'active' 
    }).populate('userId', 'name phone');
    
    console.log(`Found ${expiredInvestments.length} expired investments to complete`);
    
    const completedInvestments = [];
    
    for (const investment of expiredInvestments) {
      try {
        // Update investment status to completed and mark as pending withdrawal
        const updatedInvestment = await Investment.findByIdAndUpdate(investment._id, {
          status: 'completed',
          withdrawalStatus: 'pending',
          profitPaidAt: new Date()
        }, { new: true });
        
        completedInvestments.push(updatedInvestment);
        
        // Create profit transaction
        const Transaction = require('../models/Transaction');
        await Transaction.create({
          userId: investment.userId,
          type: 'profit',
          amount: investment.amount + investment.profitAmount,
          status: 'completed',
          userName: investment.userName,
          userPhone: investment.userPhone
        });
        
        // Update user balance with profit
        await User.findByIdAndUpdate(investment.userId, {
          $inc: { balance: investment.profitAmount }
        });
        
        console.log(`✅ Investment ${investment._id} completed for user ${investment.userName}`);
      } catch (error) {
        console.error(`❌ Error completing investment ${investment._id}:`, error);
      }
    }
    
    res.json({ 
      data: { 
        completedCount: completedInvestments.length,
        completedInvestments,
        message: `Successfully completed ${completedInvestments.length} expired investments`
      } 
    });
  } catch (err) {
    console.error('❌ Error in completeExpiredInvestments:', err);
    res.status(500).json({ message: 'Failed to complete expired investments' });
  }
};

export const approvePayment = async (req: Request, res: Response) => {
  try {
    const { investmentId } = req.params;
    const investment = await Investment.findByIdAndUpdate(investmentId, { paymentStatus: 'paid', paymentApprovedAt: new Date() }, { new: true });
    res.json({ data: { investment } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve payment' });
  }
};

export const updateUserBalance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;
    
    // Get the user to calculate the amount being added
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const amountAdded = balance - user.balance;
    
    // Update user balance
    const updatedUser = await User.findByIdAndUpdate(userId, { balance }, { new: true });
    
    // If amount is being added (positive), create an investment automatically
    if (amountAdded > 0) {
      const profitAmount = Math.round(amountAdded * 0.6); // 60% profit
      const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      const investment = await Investment.create({
        userId,
        amount: amountAdded,
        status: 'active',
        paymentStatus: 'paid', // Mark as paid since this is an admin action
        profitAmount,
        tradingPeriod: 1, // 1 hour
        expiryDate,
        createdAt: new Date(),
        userName: user.name,
        userPhone: user.phone
      });
      
      // Note: Investment will be automatically completed by the scheduled task when it expires
      console.log(`✅ Investment created for user ${user.name}: ${amountAdded} KSH, expires at ${expiryDate.toISOString()}`);
      
      res.json({ 
        data: { 
          user: updatedUser,
          investment,
          message: `Balance updated and investment created. ${profitAmount} KSH profit will be automatically credited when investment expires.`
        } 
      });
    } else {
      res.json({ data: { user: updatedUser } });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user balance' });
  }
};

export const searchUsersByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const users = await User.find({ phone: { $regex: phone, $options: 'i' } });
    res.json({ data: { users } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to search users by phone' });
  }
};

export const updateInvestmentStatus = async (req: Request, res: Response) => {
  try {
    const { investmentId } = req.params;
    const { status } = req.body;
    
    // If status is being set to 'completed', automatically set withdrawalStatus to 'pending'
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.withdrawalStatus = 'pending';
    }
    
    const investment = await Investment.findByIdAndUpdate(investmentId, updateData, { new: true });
    res.json({ data: { investment } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update investment status' });
  }
};

export const getInvestmentStats = async (req: Request, res: Response) => {
  try {
    const totalInvestments = await Investment.countDocuments();
    const activeInvestments = await Investment.countDocuments({ status: 'active' });
    const totalProfit = await Investment.aggregate([{ $group: { _id: null, total: { $sum: '$profitAmount' } } }]);
    const pendingPayments = await Investment.countDocuments({ paymentStatus: 'pending' });
    const expiredInvestments = await Investment.countDocuments({ expiryDate: { $lte: new Date() }, status: 'active' });
    res.json({ data: { stats: {
      totalInvestments,
      activeInvestments,
      totalProfit: totalProfit[0]?.total || 0,
      pendingPayments,
      expiredInvestments
    } } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get investment stats' });
  }
};

export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    // Get completed investments with pending payments
    const pendingPayments = await Investment.find({ 
      status: 'completed', 
      paymentStatus: 'pending' 
    }).populate('userId', 'name phone');
    
    // Get recent profit transactions (last 24 hours)
    const Transaction = require('../models/Transaction');
    const recentProfits = await Transaction.find({
      type: 'profit',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('userId', 'name phone');
    
    // Get pending withdrawal requests (transaction-based)
    const pendingWithdrawals = await Transaction.find({
      type: 'withdrawal',
      status: 'pending'
    }).populate('userId', 'name phone');
    
    // Get pending withdrawal investments (investment-based)
    const pendingWithdrawalInvestments = await Investment.find({
      status: 'completed',
      withdrawalStatus: 'pending'
    }).populate('userId', 'name phone');
    
    res.json({ 
      data: { 
        pendingPayments,
        recentProfits,
        pendingWithdrawals,
        pendingWithdrawalInvestments
      } 
    });
  } catch (err) {
    console.error('❌ Error in getAdminNotifications:', err);
    res.status(500).json({ message: 'Failed to get admin notifications' });
  }
}; 

// New endpoint for getting user deposits (manual deposit requests)
export const getUserDeposits = async (req: Request, res: Response) => {
  try {
    const ManualDepositRequest = require('../models/ManualDepositRequest');
    const deposits = await ManualDepositRequest.find({ status: 'pending' })
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 });
    
    res.json({ data: { deposits } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user deposits' });
  }
};

// New endpoint for getting total investments (active investments)
export const getTotalInvestments = async (req: Request, res: Response) => {
  try {
    const investments = await Investment.find({ status: 'active' })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json({ data: { investments } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get total investments' });
  }
};

// New endpoint for getting pending withdrawals (completed investments with pending withdrawal status)
export const getPendingWithdrawals = async (req: Request, res: Response) => {
  try {
    const investments = await Investment.find({ 
      status: 'completed', 
      withdrawalStatus: 'pending' 
    })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${investments.length} pending withdrawals`);
    
    res.json({ data: { investments } });
  } catch (err) {
    console.error('❌ Error getting pending withdrawals:', err);
    res.status(500).json({ message: 'Failed to get pending withdrawals' });
  }
};

// Debug endpoint to check investment statuses
export const debugInvestmentStatuses = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const activeInvestments = await Investment.find({ status: 'active' });
    const completedInvestments = await Investment.find({ status: 'completed' });
    const pendingWithdrawals = await Investment.find({ 
      status: 'completed', 
      withdrawalStatus: 'pending' 
    });
    const expiredActiveInvestments = await Investment.find({ 
      expiryDate: { $lte: now }, 
      status: 'active' 
    });
    
    res.json({ 
      data: { 
        activeInvestments: activeInvestments.length,
        completedInvestments: completedInvestments.length,
        pendingWithdrawals: pendingWithdrawals.length,
        expiredActiveInvestments: expiredActiveInvestments.length,
        currentTime: now.toISOString(),
        expiredInvestments: expiredActiveInvestments.map(inv => ({
          id: inv._id,
          userName: inv.userName,
          amount: inv.amount,
          expiryDate: inv.expiryDate,
          status: inv.status,
          withdrawalStatus: inv.withdrawalStatus
        }))
      } 
    });
  } catch (err) {
    console.error('❌ Error in debugInvestmentStatuses:', err);
    res.status(500).json({ message: 'Failed to get debug info' });
  }
};

// New endpoint to approve withdrawal (mark completed investment as paid)
export const approveWithdrawal = async (req: Request, res: Response) => {
  try {
    const { investmentId } = req.params;
    const investment = await Investment.findByIdAndUpdate(
      investmentId, 
      { 
        withdrawalStatus: 'paid', 
        withdrawalApprovedAt: new Date() 
      }, 
      { new: true }
    );
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    res.json({ data: { investment } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve withdrawal' });
  }
}; 