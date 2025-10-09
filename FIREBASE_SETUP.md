# 🔥 Firebase Setup Guide

This guide will help you set up Firebase Authentication for your React Native automotive app.

## 📋 Prerequisites

- Firebase project created
- React Native app configured
- Backend running with Firebase Auth integration

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `automotive-crm` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Update Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 5. Configure for React Native

#### For Expo (Managed Workflow)

1. Install Firebase SDK:
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/auth
   ```

2. Update `app.json`:
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
       },
       "plugins": [
         "@react-native-firebase/app"
       ]
     }
   }
   ```

#### For Bare React Native

1. Follow the [React Native Firebase setup guide](https://rnfirebase.io/)
2. Configure Android and iOS native modules
3. Update `firebase.json` with your app IDs

### 6. Test Firebase Integration

Create a test user in Firebase Console:

1. Go to Authentication > Users
2. Click "Add user"
3. Enter email: `test@example.com`
4. Enter password: `test123456`
5. Click "Add user"

### 7. Test Authentication

Run the authentication test:

```bash
# Test with Firebase token
node test-with-auth.js YOUR_FIREBASE_TOKEN
```

To get a Firebase token for testing:

1. Sign in to your app
2. Check the console logs for the Firebase token
3. Or use the Firebase Auth emulator for testing

## 🧪 Testing Your Setup

### 1. Test Backend Connection
```bash
node test-backend-connection.js
```

### 2. Test with Authentication
```bash
# Get Firebase token from your app
node test-with-auth.js YOUR_FIREBASE_TOKEN
```

### 3. Test in Your App
```typescript
import { AuthService } from './src/services/authService';

// Test sign in
const user = await AuthService.signIn('test@example.com', 'test123456');
console.log('User signed in:', user);

// Test sign up
const newUser = await AuthService.signUp('new@example.com', 'password123', 'New User');
console.log('User signed up:', newUser);
```

## 🔧 Troubleshooting

### Common Issues

1. **"Firebase not initialized"**
   - Check your Firebase configuration
   - Ensure environment variables are set correctly
   - Verify Firebase project settings

2. **"Authentication failed"**
   - Check if email/password authentication is enabled
   - Verify user exists in Firebase Console
   - Check network connectivity

3. **"Backend sync failed"**
   - Ensure backend is running
   - Check backend logs for errors
   - Verify Firebase Admin SDK configuration

### Debug Mode

Enable debug logging:

```typescript
// In your app configuration
if (__DEV__) {
  console.log('Firebase Config:', firebaseConfig);
  console.log('Current User:', AuthService.getCurrentUser());
}
```

## 📱 App Integration

### Update Login Screen

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

### Protected Routes

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

## 🎯 Next Steps

1. **Set up user roles** in your backend
2. **Configure role-based access** in your app
3. **Test all authentication flows**
4. **Set up push notifications** (optional)
5. **Configure analytics** (optional)

## 📞 Support

If you encounter issues:

1. Check Firebase Console for errors
2. Check backend logs
3. Verify network connectivity
4. Test with Firebase Auth emulator

---

**Your Firebase integration is now complete! 🎉**
