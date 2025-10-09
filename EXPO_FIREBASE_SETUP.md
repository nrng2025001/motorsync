# 🔥 Firebase Setup for Expo Apps

This guide will help you set up Firebase Authentication for your Expo React Native automotive app.

## 📋 Prerequisites

- Expo project (which you have)
- Firebase project (we'll create this)
- Backend running with Firebase Auth integration

## 🚀 Step-by-Step Setup

### **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `automotive-crm` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### **Step 2: Enable Authentication**

1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### **Step 3: Get Firebase Configuration for Web**

Since Expo uses web configuration, we need to add a web app:

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the **web icon (</>)**
4. Register your app with a nickname: "Automotive CRM Web"
5. Copy the Firebase configuration object

### **Step 4: Update Your .env File**

Create a `.env` file in your project root:

```env
# Backend API Configuration
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000

# Firebase Configuration (Replace with your actual values)
EXPO_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# App Environment
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_DEBUG_MODE=true
```

### **Step 5: Test Firebase Integration**

Run the integration test:

```bash
node test-firebase-integration.js
```

### **Step 6: Test Authentication in Your App**

Once you've set up Firebase, you can test authentication:

```typescript
import { AuthService } from './src/services/authService';

// Test sign in
const user = await AuthService.signIn('test@example.com', 'test123456');
console.log('User signed in:', user);

// Test sign up
const newUser = await AuthService.signUp('new@example.com', 'password123', 'New User');
console.log('User signed up:', newUser);
```

## 🧪 **Testing Your Setup**

### **1. Test Backend Connection**
```bash
node test-backend-connection.js
```

### **2. Test Firebase Integration**
```bash
node test-firebase-integration.js
```

### **3. Test with Authentication**
```bash
# After setting up Firebase, get a token from your app
node test-with-auth.js YOUR_FIREBASE_TOKEN
```

## 🔧 **Expo-Specific Configuration**

### **Update app.json (if needed)**

Your `app.json` should look like this:

```json
{
  "expo": {
    "name": "Automotive CRM",
    "slug": "automotive-crm",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.automotivecrm"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.automotivecrm"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Firebase not initialized"**
   - Check your `.env` file has correct Firebase configuration
   - Ensure environment variables are prefixed with `EXPO_PUBLIC_`
   - Restart your Expo development server

2. **"Authentication failed"**
   - Check if email/password authentication is enabled in Firebase Console
   - Verify user exists in Firebase Console
   - Check network connectivity

3. **"Backend sync failed"**
   - Ensure backend is running on `http://localhost:4000`
   - Check backend logs for errors
   - Verify Firebase Admin SDK configuration in backend

### **Debug Mode**

Enable debug logging in your app:

```typescript
// In your app configuration
if (__DEV__) {
  console.log('Firebase Config:', {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  });
}
```

## 📱 **App Integration**

### **Update Login Screen**

```typescript
import { useAuth } from './src/context/AuthContext';

const LoginScreen = () => {
  const { login, signup, state } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now authenticated
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      await signup(email, password, name);
      // User is now authenticated
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };
  
  // ... rest of your component
};
```

### **Protected Routes**

```typescript
import { useAuth } from './src/context/AuthContext';

const ProtectedScreen = () => {
  const { state } = useAuth();
  
  if (state.isLoading) {
    return <LoadingScreen />;
  }
  
  if (!state.isAuthenticated) {
    return <LoginScreen />;
  }
  
  return <YourProtectedContent />;
};
```

## 🎯 **Next Steps**

1. **Set up Firebase project** and get configuration
2. **Update .env file** with your Firebase credentials
3. **Test the integration** with the provided scripts
4. **Create test users** in Firebase Console
5. **Test authentication** in your app

## 📞 **Support**

If you encounter issues:

1. Check Firebase Console for errors
2. Check backend logs
3. Verify network connectivity
4. Test with Firebase Auth emulator

---

**Your Expo Firebase integration is now ready! 🎉**
