# 🔥 Firebase Configuration Verification

## Current Configuration Status

### ✅ Expo App Firebase Config
**Location:** `src/config/env.ts`

```typescript
Project ID: car-dealership-app-9f2d5
API Key: AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE
Auth Domain: car-dealership-app-9f2d5.firebaseapp.com
Storage Bucket: car-dealership-app-9f2d5.firebasestorage.app
Messaging Sender ID: 768479850678
App ID: 1:768479850678:web:e994d17c08dbe8cab87617
```

### ⚠️ Backend Firebase Config (Needs Verification)
**Location:** Backend server environment variables (Render.com or local `.env`)

The backend needs these environment variables to match:

```bash
FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
FIREBASE_PRIVATE_KEY=[Service Account Private Key]
FIREBASE_CLIENT_EMAIL=[Service Account Email]
```

## 🔍 How to Verify Backend Configuration

### Step 1: Check Backend Environment Variables

**For Local Backend:**
1. Navigate to your backend directory (where you run `npm start` or `node server.js`)
2. Check if `.env` file exists in the backend root directory
3. Open `.env` and verify these variables:
   - `FIREBASE_PROJECT_ID` should be `car-dealership-app-9f2d5`
   - `FIREBASE_PRIVATE_KEY` should be a valid service account key
   - `FIREBASE_CLIENT_EMAIL` should be a valid service account email
4. If `.env` doesn't exist, create it (see `LOCAL_BACKEND_FIREBASE_SETUP.md` for details)

**For Backend on Render.com:**
1. Go to your Render.com dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Check these variables:
   - `FIREBASE_PROJECT_ID` should be `car-dealership-app-9f2d5`
   - `FIREBASE_PRIVATE_KEY` should be a valid service account key
   - `FIREBASE_CLIENT_EMAIL` should be a valid service account email

If your backend is **local**:
1. Check your backend `.env` file
2. Verify the same variables are set correctly

### Step 2: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **car-dealership-app-9f2d5**
3. Click ⚙️ **Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Extract these values:
   - `project_id` → Use as `FIREBASE_PROJECT_ID`
   - `private_key` → Use as `FIREBASE_PRIVATE_KEY`
   - `client_email` → Use as `FIREBASE_CLIENT_EMAIL`

### Step 3: Update Backend Configuration

**For Render.com:**
1. Go to Environment tab
2. Update/add these variables:
   ```
   FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@car-dealership-app-9f2d5.iam.gserviceaccount.com
   ```
3. **Important:** For `FIREBASE_PRIVATE_KEY`, include the entire key with `\n` for newlines
4. Save and restart the service

**For Local Backend:**
1. Update your `.env` file:
   ```bash
   FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@car-dealership-app-9f2d5.iam.gserviceaccount.com
   ```
2. Restart your backend server

## 🧪 Test Configuration Match

### Test 1: Verify Token Validation

The backend should be able to verify tokens from the Expo app. If you see errors like:
- "Invalid token"
- "Token signature mismatch"
- "Firebase project mismatch"

This means the backend is using a different Firebase project.

### Test 2: Check Backend Logs

When the Expo app sends a request with a Firebase token, check backend logs:
- ✅ Should see: "Token verified successfully"
- ❌ Should NOT see: "Invalid token" or "Project mismatch"

## 📋 Configuration Checklist

- [ ] Expo app uses Firebase project: `car-dealership-app-9f2d5`
- [ ] Backend `FIREBASE_PROJECT_ID` = `car-dealership-app-9f2d5`
- [ ] Backend has valid `FIREBASE_PRIVATE_KEY` from service account
- [ ] Backend has valid `FIREBASE_CLIENT_EMAIL` from service account
- [ ] Backend service restarted after updating environment variables
- [ ] Token validation works (no "Invalid token" errors)

## 🔧 Quick Fix Script

If you have backend access, you can verify the configuration:

```bash
# Check if backend can verify tokens from the Expo app
curl -X POST http://your-backend-url/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_FROM_EXPO_APP"
```

Expected response: `{ "valid": true, "uid": "..." }`

## ⚠️ Common Issues

### Issue 1: Backend Using Different Project
**Symptom:** Token validation fails
**Fix:** Update `FIREBASE_PROJECT_ID` in backend environment

### Issue 2: Invalid Service Account Key
**Symptom:** Backend can't initialize Firebase Admin
**Fix:** Generate new private key from Firebase Console

### Issue 3: Missing Environment Variables
**Symptom:** Backend crashes on startup
**Fix:** Ensure all three variables are set in backend environment

## 📞 Need Help?

If you're still having issues:
1. Check backend logs for Firebase initialization errors
2. Verify service account has proper permissions in Firebase Console
3. Ensure backend code is using the environment variables correctly

---

**Last Updated:** Configuration verification guide

