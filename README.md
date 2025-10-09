# MotorSync - React Native App

A professional, role-based Customer Relationship Management system built specifically for the automotive industry. This app provides comprehensive tools for managing enquiries, quotations, customer interactions, and sales processes with an integrated AI assistant.

## 🚀 Features

### Role-Based Access Control
- **General Manager**: Full access to analytics, reports, and all features
- **Sales Manager**: Team management, quotation approval, performance tracking
- **Team Lead**: Team member management, enquiry assignment, progress monitoring
- **Customer Advisor**: Customer enquiry handling, quotation creation, follow-ups

### Core Functionality
- **📋 Enquiry Management**: Create, assign, track, and manage customer enquiries
- **💰 Quotation System**: Generate, approve, send, and track quotations with PDF export
- **🤖 AI Assistant**: Intelligent chat interface for sales support and guidance
- **🔔 Notifications**: Real-time notifications and reminders for important tasks
- **📊 Dashboard Analytics**: Role-specific dashboards with key performance metrics
- **👤 Profile Management**: User settings, role switching (demo), and preferences

### Technical Features
- **TypeScript**: Full TypeScript support for type safety
- **React Navigation v6**: Role-based navigation with stack and tab navigators
- **React Native Paper**: Material Design 3 components with custom automotive theme
- **Axios**: Robust API client with interceptors and error handling
- **Gifted Chat**: Professional chat interface for AI assistant
- **Expo Dev Client**: Development builds for Android and iOS
- **EAS Build**: Cloud-based build system with CI/CD integration

## 🛠 Installation

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd motorsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   ```bash
   # Android
   npm run android
   
   # iOS (macOS only)
   npm run ios
   ```

### Development Build Setup

For full native functionality, create development builds:

1. **Install EAS CLI and login**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS project**
   ```bash
   eas build:configure
   ```

3. **Build development client**
   ```bash
   # Build for both platforms
   eas build --profile development
   
   # Or build for specific platform
   eas build --profile development --platform android
   eas build --profile development --platform ios
   ```

4. **Install development build on device**
   - Download from EAS dashboard
   - Install on physical device or emulator

5. **Start dev client**
   ```bash
   npm run dev-client
   ```

## 📱 Running the App

### Development Mode

```bash
# Start Expo development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run with development client
npm run dev-client
```

### Demo Login Credentials

The app includes demo accounts for testing different user roles:

| Role | Email | Password |
|------|-------|----------|
| General Manager | `gm@motorsync.com` | `demo123` |
| Sales Manager | `sm@motorsync.com` | `demo123` |
| Team Lead | `tl@motorsync.com` | `demo123` |
| Customer Advisor | `ca@motorsync.com` | `demo123` |

## 🏗 Project Structure

```
src/
├── api/                    # API service layer
│   ├── client.ts          # Axios client configuration
│   ├── auth.ts            # Authentication endpoints
│   ├── enquiries.ts       # Enquiry management endpoints
│   ├── quotations.ts      # Quotation management endpoints
│   └── index.ts           # API exports
├── components/            # Reusable UI components
│   └── DashboardCard.tsx  # Dashboard metric cards
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── hooks/                 # Custom React hooks
├── navigation/            # Navigation configuration
│   ├── AppNavigator.tsx   # Root navigator
│   ├── AuthNavigator.tsx  # Authentication flow
│   └── MainNavigator.tsx  # Main app navigation
├── screens/               # Screen components
│   ├── auth/             # Authentication screens
│   ├── dashboard/        # Dashboard screens
│   ├── enquiries/        # Enquiry management
│   ├── quotations/       # Quotation management
│   ├── ai/               # AI assistant
│   ├── notifications/    # Notifications
│   └── profile/          # User profile
├── utils/                # Utility functions
│   └── theme.ts          # Theme configuration
└── assets/               # Static assets
```

## 🎨 Design System

### Theme
- **Primary Color**: Professional Blue (#1565C0)
- **Secondary Color**: Charcoal Gray (#424242)
- **Accent Color**: Automotive Orange (#FF6F00)
- **Typography**: System fonts optimized for readability
- **Spacing**: Consistent 8px grid system

### Components
- Material Design 3 components via React Native Paper
- Custom automotive-themed color palette
- Consistent spacing and typography
- Professional, minimal interface design

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api.motorsync.com/v1

# EAS Configuration
EAS_PROJECT_ID=your-project-id

# Other configuration
EXPO_PUBLIC_APP_ENV=development
```

### EAS Configuration

The `eas.json` file is pre-configured with three build profiles:

- **development**: Development client with debugging
- **preview**: Internal testing builds
- **production**: Production app store builds

### App Configuration

Key settings in `app.json`:
- App name and slug
- Bundle identifiers for iOS/Android
- Permissions and capabilities
- Asset configuration
- Plugin configuration

## 🚀 Deployment

### EAS Build Profiles

1. **Development Build**
   ```bash
   eas build --profile development
   ```

2. **Preview Build**
   ```bash
   eas build --profile preview
   ```

3. **Production Build**
   ```bash
   eas build --profile production
   ```

### CI/CD with GitHub Actions

The project includes automated workflows:

1. **Lint and Test**: Runs on all PRs and pushes
2. **Development Builds**: Triggered on `develop` branch
3. **Preview Builds**: Triggered on PRs to `main`
4. **Production Builds**: Triggered on `main` branch pushes

### Required Secrets

Add these secrets to your GitHub repository:

- `EXPO_TOKEN`: Your Expo authentication token

### App Store Deployment

1. **iOS App Store**
   ```bash
   eas submit --platform ios
   ```

2. **Google Play Store**
   ```bash
   eas submit --platform android
   ```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **Development build not loading**
   - Ensure device and computer are on same network
   - Check firewall settings
   - Try connecting via USB

### Device Setup

#### Android
1. Enable Developer Options
2. Enable USB Debugging
3. Install development build APK

#### iOS
1. Trust developer certificate
2. Install development build via TestFlight or direct install

### Emulator Setup

#### Android Emulator
1. Install Android Studio
2. Create AVD with API level 30+
3. Enable hardware acceleration

#### iOS Simulator
1. Install Xcode (macOS only)
2. Launch iOS Simulator
3. Choose device model

## 📚 API Documentation

### Authentication

The app uses JWT-based authentication with refresh tokens. All API endpoints are documented in the respective API files:

- `src/api/auth.ts` - Authentication endpoints
- `src/api/enquiries.ts` - Enquiry management
- `src/api/quotations.ts` - Quotation management

### API Client Features

- Automatic token refresh
- Request/response interceptors
- Error handling with user-friendly messages
- Request debouncing
- Network error detection
- Retry logic for failed requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Add comments for complex logic
- Write tests for new features
- Follow React Native best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Development platform
- [React Native](https://reactnative.dev/) - Mobile framework
- [React Native Paper](https://reactnativepaper.com/) - UI components
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [React Native Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat) - Chat interface

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

Built with ❤️ for the automotive industry
