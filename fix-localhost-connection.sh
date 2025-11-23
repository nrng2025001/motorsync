#!/bin/bash

echo "🔧 Fixing Localhost Connection Issue"
echo "═══════════════════════════════════════════════════════"
echo ""

# Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | grep -E "inet " | grep -v "127.0.0.1" | grep -v "192.0.0" | awk '{print $2}' | head -1)

if [ -z "$LOCAL_IP" ]; then
    echo "⚠️  Could not automatically detect your local IP"
    echo ""
    echo "Please find your IP manually:"
    echo "  Mac: System Preferences → Network → Wi-Fi/Ethernet → IP Address"
    echo "  Or run: ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    echo ""
    read -p "Enter your local IP address: " LOCAL_IP
fi

echo "✅ Detected local IP: $LOCAL_IP"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running on port 4000"
else
    echo "❌ Backend is NOT running!"
    echo "   Please start your backend server first"
    exit 1
fi

# Test if backend is accessible via local IP
echo ""
echo "🧪 Testing backend accessibility via $LOCAL_IP..."
if curl -s http://$LOCAL_IP:4000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is accessible via $LOCAL_IP:4000"
else
    echo "⚠️  Backend might not be accessible via network IP"
    echo "   This could be a firewall issue"
fi

# Update .env file
echo ""
echo "📝 Updating .env file..."

cat > .env << EOF
# Backend API Configuration - LOCAL DEVELOPMENT
# Updated for physical device testing

# Using local IP address (works for physical devices)
EXPO_PUBLIC_API_URL=http://$LOCAL_IP:4000/api
EXPO_PUBLIC_BACKEND_URL=http://$LOCAL_IP:4000

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

echo "✅ Updated .env file with IP: $LOCAL_IP"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Next Steps:"
echo "   1. Restart your Expo app: npx expo start --clear"
echo "   2. Make sure your phone and computer are on the same WiFi network"
echo "   3. Try logging in again"
echo ""
echo "💡 If you're using iOS Simulator or Android Emulator,"
echo "   you can change back to localhost in .env"
echo ""

