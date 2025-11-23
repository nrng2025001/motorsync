# ⚡ Quick Fix: Connection Error

## The Problem
You're getting: `Failed to connect to localhost/127.0.0.1:4000`

**This happens when:**
- ✅ Backend IS running (I confirmed it!)
- ❌ You're testing on a **physical device** (not simulator)

## 🎯 Quick Solution

### Option 1: If Using iOS Simulator or Android Emulator

**Keep using `localhost`** - it should work! Make sure:
1. You're using the simulator/emulator (not a physical device)
2. Restart Expo: `npx expo start --clear`

### Option 2: If Using Physical Device (iPhone/Android)

**You need your computer's WiFi IP address:**

1. **Find Your IP:**
   - Mac: **System Preferences** → **Network** → **Wi-Fi** → Look for "IP Address"
   - Or: Open Terminal and run: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Look for IP like: `192.168.1.XXX` or `10.0.0.XXX`

2. **Update `.env` file:**
   ```bash
   # Change from:
   EXPO_PUBLIC_API_URL=http://localhost:4000/api
   
   # To (replace with YOUR IP):
   EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
   ```

3. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

4. **Make sure:**
   - ✅ Computer and phone on same WiFi
   - ✅ Backend is running
   - ✅ Try logging in again

## 🧪 Test It Works

**From your phone's browser** (Safari/Chrome), go to:
```
http://YOUR_IP:4000/api/health
```

If you see JSON response, it works! Then try the app.

## 📍 Where to Find Your IP

**Mac:**
1. Click Apple menu → System Preferences
2. Click Network
3. Select Wi-Fi (or Ethernet)
4. Look for "IP Address" - that's what you need!

**Example IPs:**
- `192.168.1.50` ✅
- `192.168.0.100` ✅
- `10.0.0.5` ✅
- `192.0.0.2` ❌ (This is unusual, might be VPN)

---

**Need help?** See `FIX_CONNECTION_ERROR.md` for detailed troubleshooting.

