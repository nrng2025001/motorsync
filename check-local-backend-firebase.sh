#!/bin/bash

echo "🔥 Local Backend Firebase Configuration Checker"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

EXPECTED_PROJECT_ID="car-dealership-app-9f2d5"

echo "📋 Checking for backend directory..."
echo ""

# Try to find backend directory
BACKEND_DIRS=(
  "../backend"
  "../../backend"
  "../server"
  "../../server"
  "../api"
  "../../api"
  "."
)

BACKEND_FOUND=false

for dir in "${BACKEND_DIRS[@]}"; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "✅ Found potential backend directory: $dir"
    if [ -f "$dir/.env" ]; then
      echo "✅ Found .env file in $dir"
      BACKEND_FOUND=true
      
      echo ""
      echo "📄 Checking .env file contents..."
      
      if grep -q "FIREBASE_PROJECT_ID" "$dir/.env"; then
        PROJECT_ID=$(grep "FIREBASE_PROJECT_ID" "$dir/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ "$PROJECT_ID" == "$EXPECTED_PROJECT_ID" ]; then
          echo -e "${GREEN}✅ FIREBASE_PROJECT_ID matches: $PROJECT_ID${NC}"
        else
          echo -e "${RED}❌ FIREBASE_PROJECT_ID mismatch!${NC}"
          echo "   Expected: $EXPECTED_PROJECT_ID"
          echo "   Found: $PROJECT_ID"
        fi
      else
        echo -e "${YELLOW}⚠️  FIREBASE_PROJECT_ID not found in .env${NC}"
      fi
      
      if grep -q "FIREBASE_PRIVATE_KEY" "$dir/.env"; then
        echo -e "${GREEN}✅ FIREBASE_PRIVATE_KEY found${NC}"
      else
        echo -e "${YELLOW}⚠️  FIREBASE_PRIVATE_KEY not found in .env${NC}"
      fi
      
      if grep -q "FIREBASE_CLIENT_EMAIL" "$dir/.env"; then
        echo -e "${GREEN}✅ FIREBASE_CLIENT_EMAIL found${NC}"
      else
        echo -e "${YELLOW}⚠️  FIREBASE_CLIENT_EMAIL not found in .env${NC}"
      fi
      
      break
    else
      echo -e "${YELLOW}⚠️  No .env file found in $dir${NC}"
      echo "   Create .env file with Firebase configuration"
    fi
  fi
done

if [ "$BACKEND_FOUND" == false ]; then
  echo -e "${YELLOW}⚠️  Could not automatically find backend directory${NC}"
  echo ""
  echo "Please manually check your backend .env file:"
  echo "  1. Navigate to your backend directory"
  echo "  2. Check .env file exists"
  echo "  3. Verify these variables:"
  echo "     FIREBASE_PROJECT_ID=car-dealership-app-9f2d5"
  echo "     FIREBASE_PRIVATE_KEY=..."
  echo "     FIREBASE_CLIENT_EMAIL=..."
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   LOCAL_BACKEND_FIREBASE_SETUP.md"
echo ""
