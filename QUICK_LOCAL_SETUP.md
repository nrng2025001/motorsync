# ⚡ Quick Local Backend Firebase Setup

Since you're using a **local backend**, here's what you need to do:

## 🎯 The Problem

Your Expo app uses Firebase project: **`car-dealership-app-9f2d5`**

Your local backend must use the **SAME** Firebase project to validate tokens from the Expo app.

## ✅ Quick Fix (3 Steps)

### Step 1: Find Your Backend Directory

Your backend is wherever you run:
```bash
npm start
# OR
node server.js
# OR
npm run dev
```

**Common locations:**
- `../backend`
- `../../backend`
- `../server`
- A separate folder on your Desktop

### Step 2: Check/Create `.env` File

In your backend directory, create or edit `.env` file:

```bash
# Firebase Configuration (MUST match Expo app)
FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_KEY_HERE]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@car-dealership-app-9f2d5.iam.gserviceaccount.com

# Your other backend config...
PORT=4000
DATABASE_URL=postgresql://localhost:5432/your_db
```

### Step 3: Get Firebase Service Account Key

1. Go to: https://console.firebase.google.com/project/car-dealership-app-9f2d5/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Download the JSON file
4. Copy these values to your `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes and `\n`)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## 🧪 Test It

1. Restart your backend server
2. Start your Expo app
3. Try logging in
4. Check backend logs - should see successful token validation (no "Invalid token" errors)

## 📚 Full Instructions

See `LOCAL_BACKEND_FIREBASE_SETUP.md` for detailed step-by-step guide.

## 🔍 Can't Find Your Backend?

Run this in your terminal to find it:
```bash
# Find directories with package.json (likely backend)
find ~/Desktop -maxdepth 3 -name "package.json" -type f 2>/dev/null | grep -v node_modules
```

Then check each directory for server files (`server.js`, `index.js`, `app.js`).

---

**Need help?** Check `LOCAL_BACKEND_FIREBASE_SETUP.md` for troubleshooting.

