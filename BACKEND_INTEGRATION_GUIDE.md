# Backend Integration Guide

This guide will help you integrate your React Native automotive app with the car-dealership-backend system.

## 🚀 Quick Start

### 1. Backend Setup

First, ensure your backend is running:

```bash
# Navigate to your backend directory
cd car-dealership-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Set up database
npm run generate
npm run migrate
npx tsx prisma/seed-rbac.ts
npx tsx prisma/seed-universal.ts

# Start the backend server
npm run dev
```

Your backend should now be running on `http://localhost:4000`

### 2. Mobile App Configuration

Update your environment configuration:

```bash
# Copy the environment template
cp env.example .env

# Edit .env with your backend URL
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 3. Test the Connection

Run the integration tests to verify everything is working:

```typescript
import { runQuickIntegrationTest } from './src/api/integration-test';

// Run all tests
const result = await runQuickIntegrationTest();
console.log('Test Results:', result);
```

## 🔧 API Configuration

### Base URL Configuration

The app is configured to connect to your backend at:
- **Development**: `http://localhost:4000/api`
- **Staging**: `https://staging.car-dealership-backend.com/api`
- **Production**: `https://car-dealership-backend.com/api`

### Authentication

Your backend uses Firebase Authentication. The app is configured to:

1. **Sync Firebase users** to your backend database
2. **Include Firebase ID tokens** in API requests
3. **Handle role-based access control** based on your backend's RBAC system

### API Endpoints

The app includes APIs for all your backend endpoints:

#### Health & Info
- `GET /health` - Server health check
- `GET /version` - Backend version info

#### Authentication
- `POST /auth/sync` - Sync Firebase user to database
- `GET /auth/profile` - Get user profile
- `GET /auth/users` - List users (Admin/Manager)
- `POST /auth/users` - Create user (Admin)
- `PUT /auth/users/:uid/role` - Update user role (Admin)

#### Enhanced Enquiries
- `GET /enquiries` - List enquiries with filtering
- `POST /enquiries` - Create enquiry
- `GET /enquiries/:id` - Get enquiry details
- `PUT /enquiries/:id` - Update enquiry
- `DELETE /enquiries/:id` - Delete enquiry
- `GET /enquiries/models` - Get vehicle models by brand
- `GET /enquiries/variants` - Get available variants
- `GET /enquiries/colors` - Get available colors
- `GET /enquiries/sources` - Get enquiry sources

#### Enhanced Bookings
- `GET /bookings` - List bookings with advanced filtering
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking
- `PATCH /bookings/:id/assign` - Assign advisor
- `GET /bookings/:id/audit` - Get audit history
- `GET /bookings/advisor/my-bookings` - Get advisor's bookings
- `PATCH /bookings/:id/status` - Update booking status
- `POST /bookings/:id/remarks` - Add remarks

#### Bulk Import
- `POST /bookings/import/upload` - Upload Excel/CSV
- `POST /bookings/import/preview` - Preview import data
- `GET /bookings/imports` - Get import history
- `GET /bookings/imports/:id` - Get import details
- `GET /bookings/imports/:id/errors` - Download errors

#### Quotations
- `GET /quotations` - List quotations
- `POST /quotations` - Create quotation
- `GET /quotations/:id` - Get quotation details
- `PUT /quotations/:id` - Update quotation
- `DELETE /quotations/:id` - Delete quotation

## 🧪 Testing Integration

### 1. Run Integration Tests

```typescript
import { 
  runQuickIntegrationTest,
  testAllEndpoints,
  generateTestReport 
} from './src/api/integration-test';

// Quick test
const result = await runQuickIntegrationTest();

// Test all endpoints
const endpointResults = await testAllEndpoints();

// Generate report
const report = generateTestReport(result);
console.log(report);
```

### 2. Test Specific Features

```typescript
import { 
  AuthAPI, 
  BookingsAPI, 
  EnquiriesAPI 
} from './src/api';

// Test health
const health = await apiClient.get('/health');

// Test enquiry models
const models = await EnquiriesAPI.getModels();

// Test bookings
const bookings = await BookingsAPI.getBookings({ page: 1, limit: 10 });

// Test search
const searchResults = await BookingsAPI.searchBookings('test');
```

### 3. Test with Different User Roles

```typescript
// Test as Customer Advisor
const advisorBookings = await BookingsAPI.getMyBookings();

// Test as Manager (requires proper authentication)
const allBookings = await BookingsAPI.getBookings();
const importHistory = await BookingsAPI.getImports();
```

## 🔐 Authentication Setup

### Firebase Configuration

1. **Set up Firebase project** in your Firebase Console
2. **Enable Authentication** with email/password
3. **Configure your React Native app** with Firebase config
4. **Update environment variables** with Firebase config

### User Roles

Your backend supports these roles with different permissions:

- **ADMIN**: Full system access, user management
- **GENERAL_MANAGER**: Management oversight, bulk imports
- **SALES_MANAGER**: Sales operations, team management
- **TEAM_LEAD**: Team coordination, assignments
- **CUSTOMER_ADVISOR**: Own bookings only, customer interactions

### Role-Based Access Control

The app implements field-level RBAC:

- **Customer Advisors** can only access their assigned bookings
- **Managers** can view all data and manage assignments
- **Admins** have full access to all features

## 📱 Mobile App Features

### For Customer Advisors

- **My Bookings**: View assigned bookings
- **Status Updates**: Update booking status
- **Add Remarks**: Add notes to bookings
- **Customer Details**: View customer information

### For Managers

- **All Bookings**: View and manage all bookings
- **Bulk Import**: Upload Excel/CSV files
- **User Management**: Manage team members
- **Reports**: View statistics and reports

### For Admins

- **Full Access**: All features available
- **System Management**: User roles, system settings
- **Data Management**: Bulk operations, data export

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure backend is running on port 4000
   - Check firewall settings
   - Verify backend URL in environment variables

2. **Authentication Errors**
   - Verify Firebase configuration
   - Check Firebase project settings
   - Ensure user has proper role assigned

3. **API Errors**
   - Check backend logs for detailed error messages
   - Verify request format matches backend expectations
   - Check user permissions for specific endpoints

### Debug Mode

Enable debug logging:

```typescript
// In your app configuration
if (__DEV__) {
  console.log('API Base URL:', apiClient.defaults.baseURL);
  console.log('Auth Token:', await AsyncStorage.getItem('@auth_token'));
}
```

### Health Check

Test backend connectivity:

```typescript
import { checkBackendHealth, getBackendVersion } from './src/api';

const isHealthy = await checkBackendHealth();
const version = await getBackendVersion();

console.log('Backend Health:', isHealthy);
console.log('Backend Version:', version);
```

## 📊 Monitoring

### Real-time Connection Monitoring

```typescript
import { ConnectionMonitor } from './src/api';

const monitor = new ConnectionMonitor((result) => {
  console.log('Connection Status:', result);
}, 30000); // Check every 30 seconds

monitor.start();
```

### Performance Monitoring

```typescript
import { runDetailedConnectionTest } from './src/api';

const detailedResult = await runDetailedConnectionTest();
console.log('Performance:', detailedResult.performance);
```

## 🔄 Updates and Maintenance

### Backend Updates

When your backend is updated:

1. **Test integration** with new endpoints
2. **Update API types** if data models change
3. **Run integration tests** to verify compatibility
4. **Update documentation** if needed

### App Updates

When updating the mobile app:

1. **Test with current backend** version
2. **Verify all endpoints** still work
3. **Update error handling** if needed
4. **Test with different user roles**

## 📞 Support

If you encounter issues:

1. **Check the logs** in both backend and mobile app
2. **Run integration tests** to identify specific problems
3. **Verify configuration** matches this guide
4. **Test with different user roles** to isolate permission issues

## 🎯 Next Steps

1. **Set up Firebase Authentication** in your mobile app
2. **Configure user roles** in your backend
3. **Test all endpoints** with different user types
4. **Implement real-time features** if needed
5. **Set up monitoring** for production use

---

**Happy coding! 🚀**

Your React Native app is now fully integrated with your car-dealership-backend system.
