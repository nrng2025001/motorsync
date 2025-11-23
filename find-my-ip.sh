#!/bin/bash
echo "🔍 Finding Your Local IP Address..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Try multiple methods
echo "Method 1: Network interfaces..."
ifconfig | grep -B 2 "inet " | grep -E "(inet |flags|status)" | head -10

echo ""
echo "Method 2: System network info..."
networksetup -getinfo "Wi-Fi" 2>/dev/null | grep "IP address" || \
networksetup -getinfo "Ethernet" 2>/dev/null | grep "IP address" || \
echo "Could not get network info"

echo ""
echo "💡 Look for an IP address starting with:"
echo "   - 192.168.x.x"
echo "   - 10.x.x.x"
echo "   - 172.16.x.x to 172.31.x.x"
echo ""
echo "Or check: System Preferences → Network → Wi-Fi/Ethernet"
