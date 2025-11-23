# 🔧 Fix "Failed to connect to localhost" Error

## ✅ Good News!

Your backend **IS running** on port 4000! The issue is that you're testing on a **physical device**, and `localhost` doesn't work on physical devices.

## 🎯 The Problem

- **iOS Simulator / Android Emulator:** `localhost` works ✅
- **Physical iPhone / Android:** `localhost` doesn't work ❌ (it refers to the device itself, not your computer)

## 🔍 Solution: Use Your Computer's Local IP

### Step 1: Find Your Local IP Address

**On Mac:**
1. Open **System Preferences** → **Network**
2. Select **Wi-Fi** or **Ethernet**
3. Look for **IP Address** (usually starts with `192.168.x.x` or `10.x.x.x`)

**Or use Terminal:**
```bash
# Run this in your terminal:
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for an IP like:
- `192.168.1.100`
- `192.168.0.50`
- `10.0.0.5`

### Step 2: Update .env File

Edit `/Users/adityajaif/Desktop/motorsync/.env` and change:

**FROM:**
```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
```

**TO:**
```bash
EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:4000/api
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP_HERE:4000
```

**Example** (if your IP is `192.168.1.100`):
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:4000
```

### Step 3: Restart Expo App

After updating `.env`:
```bash
# Stop current Expo (Ctrl+C)
# Then restart with cache clear:
npx expo start --clear
```

### Step 4: Make Sure Same WiFi Network

- ✅ Your computer and phone must be on the **same WiFi network**
- ✅ Backend must be running on your computer
- ✅ Firewall should allow connections on port 4000

## 🧪 Test Connection

### Test 1: From Your Computer
```bash
curl http://YOUR_IP:4000/api/health
```
Should return: `{"status":"ok",...}`

### Test 2: From Your Phone Browser
Open Safari/Chrome on your phone and go to:
```
http://YOUR_IP:4000/api/health
```
Should show the same JSON response.

### Test 3: From Expo App
Try logging in again - should work now!

## 🔥 Quick Fix Script

I've created a script to help. Run:

```bash
cd /Users/adityajaif/Desktop/motorsync
./fix-localhost-connection.sh
```

Or manually update `.env` with your IP address.

## ⚠️ Troubleshooting

### Issue: Still can't connect after using IP

**Check:**
1. ✅ Backend is running: `curl http://localhost:4000/api/health`
2. ✅ Same WiFi network (computer and phone)
3. ✅ Firewall allows port 4000
4. ✅ IP address is correct

**Test firewall:**
```bash
# On Mac, check if firewall is blocking
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

### Issue: IP address keeps changing

**Solution:** Some routers assign dynamic IPs. You can:
1. Set a static IP in your router settings
2. Or just update `.env` when IP changes

### Issue: Using iOS Simulator / Android Emulator

**Solution:** You can use `localhost` for simulators:
```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

## 📝 Quick Reference

| Device Type | Use This URL |
|------------|--------------|
| iOS Simulator | `http://localhost:4000/api` |
| Android Emulator | `http://localhost:4000/api` |
| Physical iPhone | `http://YOUR_IP:4000/api` |
| Physical Android | `http://YOUR_IP:4000/api` |

---

**After fixing, restart Expo with:** `npx expo start --clear`

