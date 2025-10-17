#!/bin/bash

# Fix PATH for npx and node
export PATH="/Users/nimeshranjan/.nvm/versions/node/v22.18.0/bin:$PATH"

# Clear Metro cache
echo "Clearing Metro cache..."
npx @expo/cli start --dev-client --clear --reset-cache

# Alternative commands for reference:
# npx @expo/cli run:android
# npx @expo/cli run:ios
