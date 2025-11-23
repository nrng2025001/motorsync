# 🚀 Local Backend & Database Setup Guide

## ✅ What I Just Configured

I've created a `.env` file in your Expo app that points to your **local backend** at `http://localhost:4000/api`.

## 📋 Current Configuration

### Expo App (motorsync/.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
```

**Note:** `localhost` works for:
- ✅ iOS Simulator
- ✅ Android Emulator
- ❌ Physical devices (need your computer's IP address)

## 🔧 For Physical Devices

If you're testing on a **physical iPhone or Android device**, you need to use your computer's **local IP address** instead of `localhost`.

### Step 1: Find Your Local IP

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)

**On Linux:**
```bash
hostname -I
```

### Step 2: Update .env File

Edit `motorsync/.env` and replace `localhost` with your IP:

```bash
# Example: If your IP is 192.168.1.100
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:4000
```

### Step 3: Make Sure Your Backend is Accessible

Your backend must be running and accessible on your network:

1. **Start your backend server:**
   ```bash
   cd /path/to/your/backend
   npm start
   # OR
   node server.js
   ```

2. **Verify it's running:**
   ```bash
   curl http://localhost:4000/api/health
   # OR
   curl http://YOUR_LOCAL_IP:4000/api/health
   ```

3. **Check firewall:** Make sure port 4000 is not blocked

## 🗄️ Database Configuration

Your **local database** configuration is in your **backend's `.env` file**, not in the Expo app.

### Backend Database Config

In your backend directory, ensure `.env` has:

**For PostgreSQL:**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
# OR
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

**For MongoDB:**
```bash
MONGODB_URI=mongodb://localhost:27017/your_database
# OR
MONGO_URL=mongodb://localhost:27017/your_database
```

**For MySQL:**
```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

## ✅ Verification Checklist

- [ ] Expo app `.env` file exists with `EXPO_PUBLIC_API_URL=http://localhost:4000/api`
- [ ] Backend server is running on port 4000
- [ ] Backend `.env` has database connection string
- [ ] Database is running locally
- [ ] If using physical device, updated `.env` with local IP address
- [ ] Backend can connect to local database
- [ ] Expo app can reach backend (test with login)

## 🧪 Test Your Setup

### Test 1: Backend Health Check
```bash
curl http://localhost:4000/api/health
# Should return: {"status": "ok"} or similar
```

### Test 2: Database Connection
Check your backend logs when starting - should see:
- ✅ "Database connected"
- ✅ "Server running on port 4000"
- ❌ No database connection errors

### Test 3: Expo App Connection
1. Start Expo app: `npx expo start`
2. Try logging in
3. Check backend logs - should see API requests
4. Check Expo console - should see API responses

## 🔍 Troubleshooting

### Issue: "Network request failed" in Expo app

**Causes:**
1. Backend not running
2. Wrong IP address (if using physical device)
3. Firewall blocking port 4000

**Fix:**
1. Start backend: `cd backend && npm start`
2. Verify IP address is correct
3. Check firewall settings

### Issue: "Cannot connect to database"

**Causes:**
1. Database not running
2. Wrong connection string
3. Wrong credentials

**Fix:**
1. Start database service
2. Check backend `.env` database config
3. Test connection manually

### Issue: "localhost" doesn't work on physical device

**Cause:** Physical devices can't access `localhost` (that's the device itself)

**Fix:** Use your computer's local IP address instead

## 📝 Quick Reference

### Expo App (.env)
```bash
# For Simulator/Emulator
EXPO_PUBLIC_API_URL=http://localhost:4000/api

# For Physical Device
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api  # Replace with your IP
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Firebase (for token validation)
FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."

# Server
PORT=4000
NODE_ENV=development
```

## 🎯 Summary

✅ **Expo app** → Configured to use `http://localhost:4000/api`  
✅ **Backend** → Should be running on port 4000  
✅ **Database** → Should be configured in backend `.env`  
✅ **Firebase** → Both use same project (`car-dealership-app-9f2d5`)

---

**Next Steps:**
1. Make sure your backend is running
2. Make sure your database is running
3. Test the connection from Expo app
4. If using physical device, update `.env` with your local IP

