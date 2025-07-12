#!/bin/bash

echo "🚀 Starting Camillo Investments deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Building frontend..."
cd frontend

# Clean previous build
rm -rf build

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building React app..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed! build directory not found."
    exit 1
fi

echo "✅ Frontend build completed successfully!"

# Copy routing files to build directory
echo "📋 Copying routing configuration files..."
cp public/_redirects build/
cp public/_headers build/
cp static.json build/

echo "🔍 Verifying build contents..."
ls -la build/

echo "✅ Deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy on Render.com using the render.yaml file"
echo "3. Set your environment variables in Render dashboard"
echo "4. Test the deployment by navigating to /admin and reloading"
echo ""
echo "🎯 Your app should now work without 404 errors!" 