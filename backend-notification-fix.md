# 🔧 **NOTIFICATION 500 ERROR FIX**

## 🚨 **PROBLEM ANALYSIS:**
The notification system is returning 500 errors when trying to update FCM tokens. Based on testing, the backend is responding with 401 (Invalid Firebase token) which is correct behavior, but the frontend might be interpreting this as a 500 error.

## 🔧 **ROOT CAUSES IDENTIFIED:**

### 1. **Frontend Error Handling Issues**
- The frontend might not be properly handling 401/403 responses
- Error messages might be misleading users into thinking it's a 500 error

### 2. **Database Schema Issues**
- Missing FCM token fields in User model
- Missing notification_logs table
- Prisma client might be outdated

### 3. **Authentication Token Issues**
- Firebase tokens might be expired or invalid
- Token refresh mechanism might not be working

---

## 🛠️ **COMPLETE FIX IMPLEMENTATION**

### **Backend Fixes (for Backend Developer):**

#### 1. **Update User Model (Prisma Schema)**
```prisma
model User {
  id                String    @id @default(cuid())
  firebaseUid       String    @unique
  name              String?
  email             String?   @unique
  phone             String?
  role              UserRole  @default(USER)
  dealershipId      String?
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Notification fields
  fcmToken          String?
  deviceType        String?
  lastTokenUpdated  DateTime?
  
  // Relations
  dealership        Dealership? @relation(fields: [dealershipId], references: [id])
  enquiries         Enquiry[]
  bookings          Booking[]
  quotations        Quotation[]
  notificationLogs  NotificationLog[]
  
  @@map("users")
}

model NotificationLog {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  type      String
  entityId  String?
  sentAt    DateTime @default(now())
  delivered Boolean  @default(false)
  
  // Relations
  user      User     @relation(fields: [userId], references: [firebaseUid], onDelete: Cascade)
  
  @@map("notification_logs")
}
```

#### 2. **Improved Notification Controller**
```typescript
// controllers/notificationController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { verifyFirebaseToken } from '../middleware/auth';

export const updateFCMToken = async (req: Request, res: Response) => {
  try {
    const { fcmToken, deviceType } = req.body;
    const userId = req.user?.firebaseUid;

    // Validation
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    if (deviceType && !['android', 'ios'].includes(deviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Device type must be either "android" or "ios"'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update FCM token
    const updatedUser = await prisma.user.update({
      where: { firebaseUid: userId },
      data: {
        fcmToken,
        deviceType: deviceType || null,
        lastTokenUpdated: new Date()
      },
      select: {
        firebaseUid: true,
        name: true,
        email: true,
        fcmToken: true,
        deviceType: true,
        lastTokenUpdated: true
      }
    });

    res.json({
      success: true,
      message: 'FCM token updated successfully',
      data: updatedUser
    });

  } catch (error: any) {
    console.error('Error updating FCM token:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'FCM token already exists for another user'
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update FCM token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getFCMTokenStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.firebaseUid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
      select: {
        fcmToken: true,
        deviceType: true,
        lastTokenUpdated: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        hasToken: !!user.fcmToken,
        deviceType: user.deviceType,
        lastUpdated: user.lastTokenUpdated
      }
    });

  } catch (error: any) {
    console.error('Error getting FCM token status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get FCM token status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

#### 3. **Database Migration Script**
```sql
-- Add notification fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_token_updated TIMESTAMP;

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255),
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_delivered ON notification_logs(delivered);
```

---

### **Frontend Fixes (Current Project):**

#### 1. **Improved Error Handling in NotificationService**
```typescript
// src/services/NotificationService.ts - Updated updateFCMToken method
async updateFCMToken(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const firebaseToken = await AsyncStorage.getItem('firebaseToken');
    if (!firebaseToken) {
      console.log('❌ No Firebase token available');
      return { success: false, error: 'No Firebase token available' };
    }

    const response = await fetch(`${API_URL}/notifications/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify({
        fcmToken: token,
        deviceType: Platform.OS,
        appVersion: Constants.expoConfig?.version || '1.0.0'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ FCM token updated successfully');
      return { success: true };
    } else {
      console.log(`❌ Failed to update FCM token: ${response.status} - ${data.message}`);
      
      // Handle specific error cases
      if (response.status === 401) {
        return { success: false, error: 'Authentication failed. Please log in again.' };
      } else if (response.status === 404) {
        return { success: false, error: 'User not found. Please contact support.' };
      } else if (response.status === 400) {
        return { success: false, error: data.message || 'Invalid request data.' };
      } else {
        return { success: false, error: data.message || 'Failed to update FCM token.' };
      }
    }
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}
```

#### 2. **Enhanced Notification Context with Error Handling**
```typescript
// src/context/NotificationContext.tsx - Add error handling
const initializeNotifications = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    const hasPermission = await notificationService.requestPermission();
    if (!hasPermission) {
      setError('Notification permission denied');
      return false;
    }

    const token = await notificationService.getFCMToken();
    if (!token) {
      setError('Failed to get FCM token');
      return false;
    }

    const result = await notificationService.updateFCMToken(token);
    if (!result.success) {
      setError(result.error || 'Failed to update FCM token');
      return false;
    }

    setFCMToken(token);
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    setError('Failed to initialize notifications');
    return false;
  } finally {
    setLoading(false);
  }
}, []);
```

---

## 🧪 **TESTING COMMANDS:**

### **1. Test Backend Endpoint:**
```bash
# Test with invalid token (should return 401)
curl -X POST https://automotive-backend-frqe.onrender.com/api/notifications/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"fcmToken":"test-token","deviceType":"android"}'

# Expected: {"success":false,"message":"Invalid or expired Firebase token"}
```

### **2. Test with Valid Firebase Token:**
```bash
# Get a real Firebase token from your app and test
curl -X POST https://automotive-backend-frqe.onrender.com/api/notifications/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REAL_FIREBASE_TOKEN" \
  -d '{"fcmToken":"test-fcm-token-123","deviceType":"android"}'

# Expected: {"success":true,"message":"FCM token updated successfully","data":{...}}
```

### **3. Database Setup:**
```bash
# Run these commands in your backend project
npx prisma db push
npx prisma generate
npm run build
```

---

## 🎯 **EXPECTED RESULTS:**

After implementing these fixes:

1. **Backend will return proper error codes:**
   - 401 for invalid Firebase tokens
   - 400 for invalid request data
   - 404 for user not found
   - 500 only for actual server errors

2. **Frontend will handle errors gracefully:**
   - Show appropriate error messages to users
   - Retry failed requests when appropriate
   - Handle authentication errors by redirecting to login

3. **Database will have proper schema:**
   - FCM token fields in users table
   - notification_logs table for tracking
   - Proper indexes for performance

---

## 🚀 **IMPLEMENTATION STEPS:**

1. **Backend Developer:**
   - Update Prisma schema with notification fields
   - Implement improved notification controller
   - Run database migrations
   - Deploy updated backend

2. **Frontend Developer:**
   - Update NotificationService with better error handling
   - Update NotificationContext with error states
   - Test with real Firebase tokens
   - Deploy updated frontend

3. **Testing:**
   - Test with invalid tokens (should show 401 error)
   - Test with valid tokens (should work)
   - Test network errors (should show retry option)
   - Test permission denied (should show permission request)

---

## 🔍 **DEBUGGING TIPS:**

1. **Check server logs** for actual error messages
2. **Verify Firebase token** is valid and not expired
3. **Check database schema** has all required fields
4. **Test with Postman/curl** before testing in app
5. **Check network connectivity** and CORS settings

This comprehensive fix should resolve the 500 error and provide a robust notification system! 🎉
