# 🔧 Fix Connection Error on Emulator

## ✅ Good News for Emulator Users

Since you're using an **emulator**, `localhost` should work! Let's fix this step by step.

## 🔍 Current Status

- ✅ Backend is running on port 4000
- ✅ `.env` is configured for localhost
- ❌ App can't connect (needs restart)

## 🎯 Solution: Restart Expo with Cache Clear

The `.env` file was just updated, but Expo needs to be restarted to pick up the changes.

### Step 1: Stop Current Expo

If Expo is running, stop it:
- Press `Ctrl+C` in the terminal where Expo is running

### Step 2: Clear Cache and Restart

```bash
cd /Users/adityajaif/Desktop/motorsync
npx expo start --clear
```

The `--clear` flag:
- Clears Metro bundler cache
- Reloads environment variables
- Ensures fresh start

### Step 3: Reload App in Emulator

Once Expo starts:
- Press `r` in the Expo terminal to reload
- Or shake device → "Reload"
- Or close and reopen the app in emulator

## 🧪 Verify It Works

After restarting, try logging in again. You should see:
- ✅ No "Failed to connect" error
- ✅ API requests going through
- ✅ Login working

## 🔍 If Still Not Working

### Check 1: Verify Backend is Running

```bash
curl http://localhost:4000/api/health
```

Should return: `{"status":"ok",...}`

### Check 2: Verify .env is Loaded

In your Expo app console, you should see:
```
📋 App Configuration:
  Environment: development
  API URL: http://localhost:4000/api
```

If you see the production URL instead, the `.env` isn't loading.

### Check 3: Check Which Emulator

**Android Emulator:**
- `localhost` should work ✅
- Make sure emulator is running

**iOS Simulator:**
- `localhost` should work ✅
- Make sure simulator is running

### Check 4: Backend Binding

Make sure your backend is binding to `0.0.0.0` or `localhost`, not just a specific IP.

In your backend code, it should be:
```javascript
app.listen(4000, '0.0.0.0', () => {
  console.log('Server running on port 4000');
});
});
```

Or:
```javascript
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
```

## 📝 Quick Checklist

- [ ] Backend is running (`curl http://localhost:4000/api/health` works)
- [ ] `.env` has `EXPO_PUBLIC_API_URL=http://localhost:4000/api`
- [ ] Stopped old Expo process
- [ ] Restarted with `npx expo start --clear`
- [ ] Reloaded app in emulator
- [ ] Tried logging in again

## 🚀 Expected Result

After following these steps:
1. Expo starts with new config
2. App loads in emulator
3. Login works ✅
4. API calls succeed ✅

---

**Most Common Fix:** Just restart Expo with `--clear` flag!

