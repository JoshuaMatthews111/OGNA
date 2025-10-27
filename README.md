# OGNA - Overcomers Global Network App

A comprehensive church community app built with React Native and Expo, featuring live streaming, sermons, community features, events, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (20+ recommended)
- npm or yarn
- Xcode (for iOS development)
- CocoaPods (for iOS dependencies)

### Installation

```bash
# Clone the repository
git clone https://github.com/JoshuaMatthews111/OGNA.git
cd OGNA

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm start
```

### Running on iOS

#### Option 1: Using Expo Go (Quick Testing)
```bash
npm start
# Scan QR code with Expo Go app
```

#### Option 2: iOS Simulator
```bash
npm run ios
```

#### Option 3: Xcode (For TestFlight/Production)
```bash
# Setup iOS project
npm run setup-ios

# Open in Xcode
open ios/overcomers-global-network.xcworkspace
```

## 📱 Features

### User Features
- ✅ **Welcome & Onboarding** - Smooth introduction to the app
- ✅ **Authentication** - Member, Admin, and Guest login
- ✅ **Profile Management** - With photo upload capability
- ✅ **Home Feed** - Church stories, updates, and announcements
- ✅ **Live Streaming** - Watch live church services
- ✅ **Sermons Library** - Browse and watch past sermons
- ✅ **Community** - Posts, groups, testimonies, and prayer wall
- ✅ **Events Calendar** - View and RSVP to church events
- ✅ **Shop/Store** - Browse church merchandise
- ✅ **Music Player** - Listen to worship music
- ✅ **Settings** - Customize app preferences
- ✅ **Theme Switching** - Light, Dark, and System modes

### Admin Features
- ✅ **Master App Editor** - Customize app appearance
- ✅ **Push Notifications** - Send notifications to users
- ✅ **User Management** - Manage church members
- ✅ **Content Management** - Manage sermons, events, posts
- ✅ **Analytics Dashboard** - View app usage statistics
- ✅ **Team Management** - Manage admin team members

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **API**: tRPC + React Query
- **Backend**: Hono
- **Styling**: NativeWind (Tailwind CSS)
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage

## 📂 Project Structure

```
OGNA/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   ├── admin/             # Admin dashboard screens
│   ├── _layout.tsx        # Root layout
│   └── ...
├── components/            # Reusable components
├── constants/             # App constants and colors
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── imageUpload.ts    # Photo upload utility
│   ├── trpc.ts           # API client
│   └── youtube.ts        # YouTube integration
├── store/                 # Zustand stores
│   ├── authStore.ts      # Authentication state
│   ├── themeStore.ts     # Theme management
│   └── ...
├── backend/               # Backend API (tRPC)
│   └── trpc/             # API routes
├── assets/                # Images and fonts
├── scripts/               # Build and deployment scripts
├── DEPLOYMENT_GUIDE.md    # Detailed deployment instructions
└── FIXES_AND_IMPROVEMENTS.md  # Recent updates

```

## 🎨 Key Features Implementation

### Photo Upload
The app includes a complete photo upload system:
- Camera capture
- Photo library selection
- Image editing and cropping
- Permission handling
- Loading states and error handling

See `lib/imageUpload.ts` for implementation details.

### Theme System
Three theme modes supported:
- Light mode
- Dark mode
- System (follows device settings)

Managed by `store/themeStore.ts` with persistent storage.

### Authentication
Multiple authentication methods:
- Member login (standard users)
- Admin login (church staff)
- Guest mode (browse without account)

See `store/authStore.ts` for implementation.

## 🧪 Testing

### Run in Simulator
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🚢 Deployment

### TestFlight (iOS)

1. **Setup iOS project**:
   ```bash
   npm run setup-ios
   ```

2. **Open in Xcode**:
   ```bash
   open ios/overcomers-global-network.xcworkspace
   ```

3. **Configure signing**:
   - Select your Apple Developer Team
   - Verify bundle identifier: `com.overcomers.globalnetwork.app`

4. **Archive and upload**:
   - Product > Archive
   - Distribute to App Store Connect
   - Submit to TestFlight

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-url.com
EXPO_PUBLIC_TOOLKIT_URL=https://toolkit.rork.com
```

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues**:
```bash
npm start -- --clear
```

**CocoaPods issues**:
```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

**Node modules issues**:
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Fixes & Improvements](./FIXES_AND_IMPROVEMENTS.md) - Recent updates and fixes
- [Improvements](./IMPROVEMENTS.md) - Feature documentation

## 🤝 Contributing

This is a private church app. For internal development only.

## 📄 License

Private - All Rights Reserved

## 📞 Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: October 27, 2025  
**Status**: Ready for TestFlight Deployment
