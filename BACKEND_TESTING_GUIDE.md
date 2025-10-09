# 🧪 Backend Testing Guide

## ✅ Setup Complete!

Your app is now configured to connect to the backend server at **`10.69.245.247:4000`**

---

## 🔧 Configuration Applied

### Environment Variables (`.env`)
```bash
EXPO_PUBLIC_API_URL=http://10.69.245.247:4000/api
EXPO_PUBLIC_BACKEND_URL=http://10.69.245.247:4000
```

### Backend Connection Test Results
```
✅ Backend is reachable!
✅ Health Check: SUCCESS (200)
✅ All endpoints responding
```

---

## 🚀 How to Test

### Method 1: Use the Built-in Test Screen

1. **Start the app:**
   ```bash
   npm start -- --reset-cache
   ```

2. **In another terminal, run Android:**
   ```bash
   npm run android
   ```

3. **Navigate to the Test tab:**
   - Look for the **"Test"** tab (🧪 flask icon) in the bottom navigation
   - Tap on it to open the Backend Test Screen

4. **Run tests:**
   - Tap **"Run All Tests"** button
   - Watch as it tests all endpoints
   - See real-time results for each endpoint

### Method 2: Test from Terminal

Run the test script:
```bash
node test-backend-network.js
```

This will test all endpoints and show you detailed results.

---

## 📡 Available Endpoints

### Authentication
- **POST** `/api/auth/test-user` - Create test users
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/profile` - Get user profile

### Enquiries
- **POST** `/api/enquiries` - Create enquiry
- **GET** `/api/enquiries` - List enquiries
- **GET** `/api/enquiries/:id` - Get enquiry details
- **GET** `/api/enquiries/stats` - Get enquiry statistics

### Bookings
- **POST** `/api/bookings` - Create booking
- **GET** `/api/bookings` - List bookings
- **GET** `/api/bookings/:id` - Get booking details
- **PATCH** `/api/bookings/:id/status` - Update booking status
- **GET** `/api/bookings/stats` - Get booking statistics

### Quotations
- **GET** `/api/quotations` - List quotations
- **GET** `/api/quotations/:id` - Get quotation details
- **GET** `/api/quotations/stats` - Get quotation statistics

### Stock
- **GET** `/api/stock` - List stock items
- **GET** `/api/stock/:id` - Get stock details
- **GET** `/api/stock/stats` - Get stock statistics

### Other
- **POST** `/api/bookings/import/upload` - Bulk import
- **GET** `/api/bookings/advisor/my-bookings` - Advisor bookings

---

## 🔍 Testing Workflow

### 1. Test Health Check (No Auth)
```bash
curl http://10.69.245.247:4000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend running 🚀",
  "timestamp": "2025-10-08T15:19:41.111Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Create Test User
From the app's Test screen, this will:
- Create a test user with Firebase authentication
- Return user credentials
- Allow you to login and test other endpoints

### 3. Test Protected Endpoints
Once logged in, the app will automatically:
- Add Firebase token to all requests
- Test all protected endpoints
- Show you the results

---

## 📱 In-App Testing Features

The **Backend Test Screen** provides:

✅ **Real-time Configuration Display**
- Shows current API URL
- Shows backend URL
- Shows environment

✅ **Comprehensive Endpoint Testing**
- Tests all major endpoints
- Shows success/failure status
- Displays response times
- Shows error messages

✅ **Test Summary**
- Total tests passed
- Total tests failed
- Overall status

✅ **Color-coded Results**
- 🟢 Green = Success
- 🔴 Red = Error
- 🟡 Yellow = Pending

---

## 🐛 Troubleshooting

### If Tests Fail:

#### 1. Check Backend Server
```bash
# From your Mac terminal
curl http://10.69.245.247:4000/api/health
```

#### 2. Check Network Connection
```bash
# Ping the backend server
ping 10.69.245.247
```

#### 3. Check Firewall
- Ensure port 4000 is open on the backend machine
- Backend should be listening on `0.0.0.0` (not `127.0.0.1`)

#### 4. Verify IP Address
- Make sure `10.69.245.247` is the correct IP
- Both machines should be on the same network

#### 5. Check Backend Logs
- Look at backend console for incoming requests
- Check for any errors or issues

### Common Issues:

**❌ "Network Error"**
- Backend not running
- Wrong IP address
- Firewall blocking connection
- Different network

**❌ "401 Unauthorized"**
- Normal for protected endpoints without login
- Use the app to login first
- Firebase token not being sent

**❌ "500 Internal Server Error"**
- Backend database issue
- Check backend logs
- Verify database is running

---

## 📊 Expected Test Results

### Without Authentication:
```
✅ Health Check: SUCCESS
⚠️  Create Test User: May fail (database issue)
❌ List Enquiries: 401 (auth required)
❌ List Bookings: 401 (auth required)
❌ Get Stock: 401 (auth required)
❌ Get Quotations: 401 (auth required)
```

### With Authentication (after login):
```
✅ Health Check: SUCCESS
✅ Create Test User: SUCCESS
✅ List Enquiries: SUCCESS
✅ List Bookings: SUCCESS
✅ Get Stock: SUCCESS
✅ Get Quotations: SUCCESS
```

---

## 🎯 Next Steps

1. **Start your app with the new configuration:**
   ```bash
   npm start -- --reset-cache
   npm run android
   ```

2. **Open the Test tab** (🧪 flask icon)

3. **Tap "Run All Tests"** to verify all endpoints

4. **Login** to the app to test authenticated endpoints

5. **Navigate** to different screens to see real API data

---

## 📝 Notes

- The **Test tab** will only appear in development mode
- All API requests are logged in the Metro bundler console
- You can see detailed request/response logs in development
- The configuration is automatically loaded from `.env`

---

## ✨ Success Indicators

You'll know everything is working when:

✅ App starts without errors  
✅ Test screen shows correct API URL (`http://10.69.245.247:4000/api`)  
✅ Health Check test passes  
✅ You can create test users  
✅ You can login successfully  
✅ Protected endpoints return data after login  
✅ Dashboard loads real statistics  
✅ Enquiries/Bookings screens show real data  

---

**🎉 Your app is now connected to the backend server!**

For any issues, check the troubleshooting section above or review the backend logs.

