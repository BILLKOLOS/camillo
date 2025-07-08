#!/bin/bash

echo "🚀 Starting Camillo Investments Development Environment..."

# Start backend
echo "📡 Starting backend server on port 3000..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend on port 3001..."
cd ..
npm install
npm start &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo "   Backend: http://localhost:3000"
echo "   Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping servers..."
kill $BACKEND_PID $FRONTEND_PID
echo "✅ Servers stopped" 