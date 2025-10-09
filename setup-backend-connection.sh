#!/bin/bash

# Backend Connection Setup Script
# This script configures your app to connect to the backend server

BACKEND_IP="10.69.245.247"
BACKEND_PORT="4000"

echo "🔧 Setting up backend connection..."
echo "📡 Backend Server: http://${BACKEND_IP}:${BACKEND_PORT}"
echo ""

# Create .env file
cat > .env << EOF
# Backend API Configuration - Network Server
EXPO_PUBLIC_API_URL=http://${BACKEND_IP}:${BACKEND_PORT}/api
EXPO_PUBLIC_BACKEND_URL=http://${BACKEND_IP}:${BACKEND_PORT}

# App Environment
EXPO_PUBLIC_APP_ENV=development

# Firebase Configuration (for authentication)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=car-dealership-app-9f2d5.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=car-dealership-app-9f2d5.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=768479850678
EXPO_PUBLIC_FIREBASE_APP_ID=1:768479850678:web:e994d17c08dbe8cab87617
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WSF9PY0QPL
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://car-dealership-app-9f2d5.firebaseio.com

# Development/Testing
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
EOF

echo "✅ Created .env file with backend configuration"
echo ""

# Test if backend is reachable
echo "🧪 Testing backend connectivity..."
echo ""

if command -v curl &> /dev/null; then
    echo "Testing health endpoint: http://${BACKEND_IP}:${BACKEND_PORT}/api/health"
    if curl -s -f -m 5 "http://${BACKEND_IP}:${BACKEND_PORT}/api/health" > /dev/null 2>&1; then
        echo "✅ Backend is reachable!"
        echo ""
        curl -s "http://${BACKEND_IP}:${BACKEND_PORT}/api/health" | head -c 200
        echo ""
    else
        echo "⚠️  Cannot reach backend server"
        echo "💡 Make sure:"
        echo "   1. Backend server is running"
        echo "   2. Both machines are on the same network"
        echo "   3. Backend is listening on 0.0.0.0 (not just localhost)"
        echo "   4. Firewall allows port ${BACKEND_PORT}"
    fi
else
    echo "⚠️  curl not found, skipping connectivity test"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: npm start -- --reset-cache"
echo "   2. In another terminal: npm run android"
echo "   3. Or run: node test-backend-network.js (for detailed endpoint testing)"
echo ""

