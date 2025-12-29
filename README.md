# TeamLink - React Native App

A comprehensive team management app built with React Native and Expo, similar to Connecteam.

## Features

- 📊 **Dashboard** - Overview with quick actions and recent activity
- ⏰ **Time Clock** - Clock in/out with location tracking
- 📅 **Schedule** - View and manage work schedules
- ✅ **Tasks** - Task management with priorities and filters
- 💬 **Chat** - Team communication
- 📢 **Updates** - Company announcements and updates
- 📋 **Forms & Checklists** - Digital forms and checklists
- 👥 **Directory** - Employee directory
- 📚 **Knowledge Base** - Company resources and articles
- 🎓 **Training** - Employee training courses
- 📄 **Documents** - Document library
- ⚙️ **Settings** - App settings and profile

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- Expo Go app on your iOS/Android device (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS simulator (requires macOS):
```bash
npm run ios
```

4. Run on Android emulator:
```bash
npm run android
```

5. Scan QR code with Expo Go app on your phone

## Development on Windows

This app is built with React Native and Expo, which allows you to develop on Windows and deploy to both iOS and Android.

### For iOS Development on Windows:

1. **Use Expo Go** (Recommended for development):
   - Install Expo Go on your iPhone
   - Run `npm start` and scan the QR code
   - No Mac required for development!

2. **Build for iOS** (Requires Mac or cloud service):
   - Use services like [Expo Application Services (EAS)](https://expo.dev/build) to build iOS apps in the cloud
   - Or use a Mac/cloud Mac service for final builds

### For Android Development on Windows:

- Install Android Studio
- Set up Android emulator
- Run `npm run android`

## Project Structure

```
TeamLink/
├── src/
│   ├── screens/          # Screen components
│   ├── context/           # React Context for state management
│   ├── components/       # Reusable components
│   └── utils/            # Utility functions
├── assets/               # Images and static assets
├── App.js               # Main app entry point
└── package.json         # Dependencies
```

## Technologies Used

- React Native 0.81
- Expo SDK 54
- React 19.1.0
- React Navigation
- Expo Vector Icons
- React Native Calendars (for schedule)

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## License

MIT

