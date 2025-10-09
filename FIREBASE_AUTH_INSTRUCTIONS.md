# 🔥 Firebase Authentication Fix Instructions

## ❌ Current Error
```
ERROR Sign in error: [FirebaseError: Firebase: Error (auth/invalid-credential).]
```

## 🎯 What This Means
The credentials `advisor@test.com` / `TestPass123!` are **NOT VALID** in Firebase Authentication for your project.

This error occurs when:
1. ✅ Firebase project is correct (`car-dealership-app-9f2d5`)
2. ✅ App configuration is correct
3. ❌ BUT the user doesn't exist OR password is wrong

## 🔧 SOLUTION: Create the User in Firebase

### Step 1: Access Firebase Console
1. Go to: https://console.firebase.google.com/
2. Sign in with your Google account
3. Select project: **car-dealership-app-9f2d5**

### Step 2: Create the Test User
1. In left sidebar, click **"Authentication"**
2. Click **"Users"** tab at the top
3. Click **"Add user"** button

### Step 3: Enter User Details
```
Email: advisor@test.com
Password: TestPass123!
```
4. Click **"Add user"**

### Step 4: Verify User is Created
You should see the user listed with:
- Email: advisor@test.com
- User UID: (some long string)
- Sign-in provider: Email/Password
- Created: (today's date)

### Step 5: Test Login
1. Open your MotorSync app
2. Enter:
   - Email: `advisor@test.com`
   - Password: `TestPass123!`
3. Click Login

✅ **Login should now work!**

---

## 🔍 Alternative: Check if User Already Exists

If you think the user might already exist but with a different password:

### Option A: Reset Password in Firebase Console
1. Go to Authentication → Users
2. Find advisor@test.com
3. Click the 3 dots menu (⋮) on the right
4. Select "Reset password"
5. Set new password: `TestPass123!`
6. Try login again

### Option B: Use a Different User
If you have other test users, try logging in with their credentials.

---

## 🚀 For Backend Developer

If you're the backend developer, you need to:

1. **Create Firebase Users** for all test accounts
2. **Sync users** in backend database when they first login
3. Make sure backend `/api/auth/profile` endpoint returns user data

### Test Accounts to Create in Firebase:
```
advisor@test.com / TestPass123!
gm@motorsync.com / demo123
sm@motorsync.com / demo123
tl@motorsync.com / demo123
ca@motorsync.com / demo123
```

---

## 📊 Using the Debug Screen

I've created a Debug Screen that helps diagnose issues. To use it:

### Temporary Test:
In `App.tsx`, temporarily add:
```typescript
import { DebugAuthScreen } from './src/screens/auth/DebugAuthScreen';

export default function App() {
  return <DebugAuthScreen />;
}
```

Then run the app and press "Run Diagnostics". It will show:
- ✅ Firebase configuration
- ✅ Authentication attempt
- ✅ Exact error with solutions
- ✅ Backend API test

---

## ❓ Common Questions

**Q: Why doesn't the user exist in Firebase?**
A: Firebase Authentication is separate from your backend database. Users must be created in both places (Firebase does auth, backend does authorization/data).

**Q: Can the backend create Firebase users automatically?**
A: Yes, but you'd need Firebase Admin SDK on the backend. Easier to create them manually in Firebase Console.

**Q: What if I get a different error?**
A: Run the Debug Screen - it will show exactly what's wrong and how to fix it.

---

## ✅ Expected Result After Fix

When you login successfully, console should show:
```
🔐 AuthService: Attempting Firebase sign-in...
  Email: advisor@test.com
  Firebase Project: car-dealership-app-9f2d5
✅ Firebase sign-in successful
  UID: [your-user-uid]
  Email: advisor@test.com
✅ Auth token stored successfully
✅ Backend profile retrieved
User: Test Advisor
Role: CUSTOMER_ADVISOR
```

---

## 🆘 Still Not Working?

1. **Double-check Email**: Must be exactly `advisor@test.com` (lowercase)
2. **Double-check Password**: Must be exactly `TestPass123!` (case-sensitive)
3. **Check Firebase Console**: User should be visible in Authentication → Users
4. **Run Debug Screen**: Will show detailed diagnostics

---

## 📞 Need Help?

If you've created the user in Firebase Console and still getting errors, run the Debug Screen and share the output!

