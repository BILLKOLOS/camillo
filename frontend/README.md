# Camillo Investments - 60% Profit Trading System

A comprehensive investment platform that automatically manages client investments with a guaranteed 60% profit return after a set trading period.

## 🚀 Features

### Investment System
- **Automatic Trading Start**: When admin or bot updates client balance, trading starts immediately
- **60% Profit Guarantee**: All investments return 60% profit after trading period
- **Trading Period**: Configurable trading period (default: 24 hours)
- **Payment Status Tracking**: Separate tracking for investment completion and payment approval
- **Admin Notifications**: Real-time notifications for completed investments awaiting payment

### Admin Dashboard
- **User Search**: Search users by phone number
- **Balance Management**: Update user balances manually or via MPESA bot
- **Payment Approval**: Mark completed investments as paid
- **Investment Statistics**: Real-time stats including pending payments
- **Expired Investment Management**: Complete expired investments automatically

### MPESA Bot Integration
- **Automatic Balance Updates**: Bot updates user balance when MPESA payment received
- **Instant Trading Start**: Trading begins immediately after balance update
- **Transaction Tracking**: Complete audit trail of all transactions

## 📋 Investment Flow

### Scenario: John Kamau Investment
1. **Deposit**: John Kamau deposits 5000 KSH to admin phone number
2. **Balance Update**: Admin or MPESA bot updates John's dashboard balance
3. **Trading Start**: Investment automatically starts trading
4. **Profit Calculation**: 60% profit (3000 KSH) calculated automatically
5. **Completion**: After trading period, investment status becomes "completed"
6. **Admin Notification**: Admin notified of completed investment with pending payment
7. **Payment Approval**: Admin marks payment as "paid" after disbursing funds

## 🛠️ Technical Implementation

### Backend (Node.js + Express + MongoDB)

#### Investment Model
```typescript
interface Investment {
  userId: ObjectId;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'trading';
  paymentStatus: 'pending' | 'paid';
  profitAmount: number;
  tradingPeriod: number;
  expiryDate: Date;
  createdAt: Date;
  profitPaidAt?: Date;
  paymentApprovedAt?: Date;
}
```

#### Key Services
- **InvestmentService**: Manages investment lifecycle
- **Automatic Trading**: Starts trading when balance updated
- **Expired Investment Handler**: Completes expired investments
- **Payment Approval**: Manages payment status

#### API Endpoints
```
POST   /api/investments                    # Create investment
GET    /api/investments                    # Get all investments (admin)
GET    /api/investments/my-investments     # Get client investments
GET    /api/investments/phone/:phone       # Get investments by phone
GET    /api/investments/pending-payments   # Get pending payments
GET    /api/investments/expired            # Get expired investments
POST   /api/investments/complete-expired   # Complete expired investments
PATCH  /api/investments/:id/approve-payment # Approve payment
PATCH  /api/investments/user/:userId/balance # Update user balance
GET    /api/investments/search-users/:phone # Search users by phone
GET    /api/investments/stats              # Get investment statistics
```

### Frontend (React + TypeScript)

#### Admin Dashboard Features
- **Real-time Statistics**: Live updates of investment metrics
- **User Search**: Search functionality by phone number
- **Payment Management**: Approve payments for completed investments
- **Investment Overview**: Complete view of all investments and statuses
- **Notification System**: Badge notifications for pending payments

#### Key Components
- **AdminDashboardPage**: Main admin interface
- **InvestmentService**: Frontend service for API calls
- **Status Badges**: Visual indicators for investment and payment status

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
npm install
npm start
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/camillo-investments
JWT_SECRET=your-jwt-secret
PORT=3001
```

## 🧪 Testing

### Run Test Script
```bash
cd backend
node test-mpesa-bot.js
```

The test script demonstrates:
- Complete investment flow
- MPESA bot integration
- Admin dashboard functionality
- Payment approval process

## 📊 Investment Statistics

The system tracks:
- **Total Investments**: Sum of all investment amounts
- **Active Investments**: Currently trading investments
- **Total Profit**: Sum of all paid profits
- **Pending Payments**: Completed investments awaiting payment approval
- **Expired Investments**: Investments past trading period

## 🔄 Scheduled Tasks

### Automatic Investment Completion
- Runs every hour to complete expired investments
- Updates user balances with profit amounts
- Creates profit transactions
- Moves investments to "completed" status

## 🎯 Business Logic

### Investment Rules
1. **Minimum Investment**: 1000 KSH
2. **Profit Rate**: 60% of investment amount
3. **Trading Period**: 24 hours (configurable)
4. **Automatic Start**: Trading begins when balance updated
5. **Payment Approval**: Admin must approve payment after completion

### Status Flow
```
pending → trading → completed (payment pending) → paid
```

## 🔐 Security Features

- JWT authentication for all API endpoints
- Role-based access control (admin/client)
- Input validation and sanitization
- Transaction rollback on errors
- Secure password hashing

## 📱 MPESA Bot Integration

The MPESA bot automatically:
1. Receives MPESA messages
2. Parses sender phone number and amount
3. Finds corresponding user
4. Updates user balance
5. Triggers automatic trading start

## 🚀 Deployment

### Production Setup
1. Set up MongoDB Atlas or production MongoDB
2. Configure environment variables
3. Deploy backend to cloud platform
4. Deploy frontend to static hosting
5. Set up SSL certificates
6. Configure domain and DNS

### Monitoring
- Health check endpoint: `/api/health`
- Log monitoring for scheduled tasks
- Error tracking and alerting
- Performance monitoring

## 📞 Support

For technical support or questions about the investment system, please contact the development team.

---

**Note**: This system is designed for educational and demonstration purposes. Ensure compliance with local financial regulations before using in production.
