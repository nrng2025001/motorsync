# 🔥 Local Backend Firebase Configuration Guide

Since you're using a **local backend** and **local database**, here's how to ensure your Firebase configuration matches between your Expo app and local backend.

## ✅ Current Expo App Configuration

Your Expo app is configured with:
- **Project ID:** `car-dealership-app-9f2d5`
- **API Key:** `AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE`
- **Auth Domain:** `car-dealership-app-9f2d5.firebaseapp.com`

## 🔧 Local Backend Configuration

Your local backend needs to have these environment variables in its `.env` file:

### Required Environment Variables

Create or update your backend's `.env` file with:

```bash
# Firebase Configuration (MUST match Expo app)
FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@car-dealership-app-9f2d5.iam.gserviceaccount.com

# Database Configuration (Local)
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
# OR for MongoDB:
# MONGODB_URI=mongodb://localhost:27017/your_database

# Server Configuration
PORT=4000
NODE_ENV=development
```

## 📋 Step-by-Step Setup

### Step 1: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **car-dealership-app-9f2d5**
3. Click ⚙️ **Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file (e.g., `car-dealership-app-9f2d5-firebase-adminsdk-xxxxx.json`)

### Step 2: Extract Values from JSON

Open the downloaded JSON file and extract:

```json
{
  "project_id": "car-dealership-app-9f2d5",  // → FIREBASE_PROJECT_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // → FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxxxx@car-dealership-app-9f2d5.iam.gserviceaccount.com"  // → FIREBASE_CLIENT_EMAIL
}
```

### Step 3: Update Backend .env File

1. Navigate to your backend directory
2. Create or edit `.env` file
3. Add the Firebase configuration:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PASTE_FULL_PRIVATE_KEY_HERE]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@car-dealership-app-9f2d5.iam.gserviceaccount.com
```

**Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Include the `\n` characters in the private key (they represent newlines)
- Replace `[PASTE_FULL_PRIVATE_KEY_HERE]` with the actual private key from the JSON file

### Step 4: Verify Backend Code Uses These Variables

Check your backend code (usually in a file like `config/firebase.js` or `src/config/firebase.ts`) to ensure it reads from environment variables:

```javascript
// Example backend Firebase initialization
const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
```

### Step 5: Restart Your Backend Server

After updating `.env`:
```bash
# Stop your backend server (Ctrl+C)
# Then restart it
npm start
# OR
node server.js
# OR
npm run dev
```

## 🧪 Test Configuration

### Test 1: Check Backend Logs

When you start your backend, you should see:
- ✅ Firebase initialized successfully
- ✅ No "Invalid project ID" errors
- ✅ No "Invalid credentials" errors

### Test 2: Test Token Validation

1. Start your Expo app
2. Log in with Firebase
3. Make an API request to your local backend
4. Check backend logs - should see successful token validation

### Test 3: Quick API Test

```bash
# Get a Firebase token from your Expo app (check console logs)
# Then test with curl:
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Expected: Should return user profile, not "Invalid token" error

## 🔍 Troubleshooting

### Issue: "Invalid token" or "Token signature mismatch"

**Cause:** Backend is using a different Firebase project

**Fix:**
1. Verify `FIREBASE_PROJECT_ID` in backend `.env` = `car-dealership-app-9f2d5`
2. Ensure service account credentials are from the same project
3. Restart backend after changes

### Issue: "Invalid credentials" or "Service account not found"

**Cause:** Wrong service account credentials

**Fix:**
1. Generate new private key from Firebase Console
2. Copy exact values from JSON file
3. Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters
4. Restart backend

### Issue: Backend can't find environment variables

**Cause:** `.env` file not in correct location or not loaded

**Fix:**
1. Ensure `.env` is in backend root directory
2. Check if backend uses `dotenv` package:
   ```javascript
   require('dotenv').config();
   ```
3. Verify `.env` file is not in `.gitignore` (it should be, but make sure it exists locally)

## 📝 Quick Reference

### Expo App (.env in motorsync/)
```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
```

### Backend (.env in backend directory)
```bash
FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@car-dealership-app-9f2d5.iam.gserviceaccount.com
PORT=4000
```

## ✅ Verification Checklist

- [ ] Backend `.env` has `FIREBASE_PROJECT_ID=car-dealership-app-9f2d5`
- [ ] Backend `.env` has valid `FIREBASE_PRIVATE_KEY` (with quotes and `\n`)
- [ ] Backend `.env` has valid `FIREBASE_CLIENT_EMAIL`
- [ ] Backend code reads from `process.env.FIREBASE_PROJECT_ID`
- [ ] Backend restarted after updating `.env`
- [ ] Backend logs show "Firebase initialized" (no errors)
- [ ] Expo app can authenticate and make API calls successfully

## 🆘 Still Having Issues?

1. **Check backend logs** for Firebase initialization errors
2. **Verify service account** has proper permissions in Firebase Console
3. **Test token validation** directly in backend code
4. **Compare project IDs** - they must match exactly

---

**Need to find your backend directory?** It's usually where you run `npm start` or `node server.js` for your backend server.

