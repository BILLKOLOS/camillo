# Automatic Pending Withdrawals System

## Overview

The automatic pending withdrawals system ensures that completed investments are automatically marked for withdrawal approval without any manual intervention. This system is a key component of the three major transaction types in the admin dashboard.

## How It Works

### 1. Investment Lifecycle

1. **Investment Creation**: When a user creates an investment, it's marked as `active` with an `expiryDate`
2. **Automatic Expiration**: The system checks every 5 minutes for expired investments
3. **Automatic Completion**: Expired investments are automatically marked as `completed` with `withdrawalStatus: 'pending'`
4. **Pending Withdrawal**: Completed investments appear in the admin dashboard's "Pending Withdrawals" section
5. **Admin Approval**: Admin can approve withdrawals, marking them as `paid`

### 2. Scheduled Task

The system runs a scheduled task every 5 minutes in `server.ts`:

```javascript
// Scheduled task to complete expired investments
const completeExpiredInvestments = async () => {
  try {
    const now = new Date();
    
    // Find all expired investments that are still active
    const expiredInvestments = await Investment.find({ 
      expiryDate: { $lte: now }, 
      status: 'active' 
    }).populate('userId', 'name phone');
    
    if (expiredInvestments.length > 0) {
      console.log(`Found ${expiredInvestments.length} expired investments to complete`);
      
      for (const investment of expiredInvestments) {
        try {
          // Update investment status to completed and mark as pending withdrawal
          const updatedInvestment = await Investment.findByIdAndUpdate(investment._id, {
            status: 'completed',
            withdrawalStatus: 'pending',
            profitPaidAt: new Date()
          }, { new: true });
          
          console.log(`✅ Investment ${investment._id} marked as completed with pending withdrawal status`);
          
          // Create profit transaction and update user balance
          // ... additional logic
        } catch (error) {
          console.error(`❌ Error completing investment ${investment._id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in completeExpiredInvestments task:', error);
  }
};

// Run the task every 5 minutes
setInterval(completeExpiredInvestments, 5 * 60 * 1000);
```

### 3. Manual Trigger

Admins can also manually trigger the completion of expired investments using the "Complete Expired" button in the admin dashboard or by calling the API endpoint:

```bash
POST /api/investments/complete-expired
```

## API Endpoints

### Get Pending Withdrawals
```bash
GET /api/investments/admin/pending-withdrawals
```
Returns all completed investments with `withdrawalStatus: 'pending'`

### Approve Withdrawal
```bash
PATCH /api/investments/admin/:investmentId/approve-withdrawal
```
Marks a completed investment as paid

### Debug Statuses
```bash
GET /api/investments/admin/debug-statuses
```
Returns current system status including counts of active, completed, and pending investments

## Frontend Integration

### Admin Dashboard Features

1. **Visual Indicators**: The "Pending Withdrawals" card changes color when there are pending withdrawals
2. **Notification Badge**: Shows the count of pending withdrawals
3. **Real-time Updates**: Checks for new pending withdrawals every 30 seconds
4. **Notifications**: Shows alerts when new withdrawals are available
5. **Manual Trigger**: "Complete Expired" button to manually trigger completion

### Key Components

- **Periodic Refresh**: Automatically fetches pending withdrawals every 30 seconds
- **Visual Feedback**: Cards change appearance when there are pending items
- **Notifications**: Real-time alerts for new pending withdrawals
- **Approval Interface**: Easy-to-use interface for approving withdrawals

## Database Schema

### Investment Model Updates

```typescript
interface IInvestment {
  // ... existing fields
  withdrawalStatus?: 'pending' | 'paid';  // New field
  withdrawalApprovedAt?: Date;           // New field
  userName?: string;                     // For direct access
  userPhone?: string;                    // For direct access
}
```

## Testing

### Test Scripts

1. **`test-automatic-withdrawals.js`**: Comprehensive end-to-end test
2. **`create-test-investment.js`**: Creates test investments that expire quickly
3. **`test-pending-withdrawals.js`**: Basic functionality test

### Running Tests

```bash
# Test the complete system
node test-automatic-withdrawals.js

# Create a test investment (expires in 1 minute)
node create-test-investment.js

# Basic functionality test
node test-pending-withdrawals.js
```

## Troubleshooting

### Common Issues

1. **Investments not completing automatically**
   - Check server logs for scheduled task errors
   - Verify `expiryDate` is set correctly
   - Use debug endpoint to check current status

2. **Pending withdrawals not appearing**
   - Check if investments are marked as `completed`
   - Verify `withdrawalStatus` is set to `pending`
   - Check frontend periodic refresh is working

3. **Manual completion not working**
   - Verify admin permissions
   - Check API endpoint is accessible
   - Review server logs for errors

### Debug Commands

```bash
# Check current system status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://camillo-backend.onrender.com/api/investments/admin/debug-statuses

# Manually complete expired investments
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  https://camillo-backend.onrender.com/api/investments/complete-expired

# Get pending withdrawals
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://camillo-backend.onrender.com/api/investments/admin/pending-withdrawals
```

## Monitoring

### Server Logs

The system provides detailed logging:

- `✅ Investment completed for user [name]: [amount] + [profit] profit`
- `❌ Error completing investment [id]: [error]`
- `ℹ️ No expired investments found at [timestamp]`

### Dashboard Indicators

- **Pending Withdrawals Count**: Real-time count in admin dashboard
- **Visual Alerts**: Cards change color when there are pending items
- **Notification System**: Real-time alerts for new pending withdrawals

## Security

- All endpoints require admin authentication
- Investment completion is logged for audit purposes
- Withdrawal approval requires admin privileges
- System prevents duplicate completions

## Performance

- Scheduled task runs every 5 minutes (configurable)
- Frontend checks every 30 seconds for updates
- Database queries are optimized with proper indexing
- Minimal impact on system performance

## Future Enhancements

1. **Email Notifications**: Send email alerts to admins
2. **SMS Notifications**: Send SMS alerts for urgent withdrawals
3. **Bulk Approval**: Approve multiple withdrawals at once
4. **Advanced Filtering**: Filter withdrawals by date, amount, user
5. **Audit Trail**: Complete history of all withdrawal actions 