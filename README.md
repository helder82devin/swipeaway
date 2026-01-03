# Swipe Away

A cross-platform mobile app (iOS + Android) built with React Native (Expo) that helps users delete photos quickly and safely using swipe-based decision sessions.

## Features (Phase 1)

- **Random Photo Sessions**: Review 15 random photos from your library in each session
- **Swipe Interaction**: Swipe right to keep, left to mark for deletion
- **Polished Animations**: Smooth swipe animations with directional resistance and haptic feedback
- **Photo Metadata**: View date and location (city/country) for each photo
- **Undo Support**: Undo your last swipe decision (1 undo per session)
- **Session Progress**: Clear progress indicator showing your position in the session
- **End-of-Session Confirmation**: Review and confirm deletions before they happen
- **Freemium Model**: 2 free sessions per day, with mock ad button for extra sessions
- **Settings**: Toggle haptic feedback and exclude recent photos

## Tech Stack

- React Native with Expo (TypeScript)
- Zustand for state management
- React Navigation for navigation
- expo-media-library for photo access
- expo-haptics for haptic feedback
- react-native-gesture-handler for swipe gestures
- react-native-reanimated for animations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
  components/     # Reusable UI components
  screens/        # Screen components
  services/       # Business logic and API services
  store/          # Zustand state management
  types/          # TypeScript type definitions
  constants/      # App constants and configuration
  hooks/          # Custom React hooks
  utils/          # Utility functions
```

## Privacy

- Only accesses local photos on your device
- Favorites are always excluded from sessions
- Recently taken photos are excluded by default (configurable)
- No cloud integrations or data collection
