# Rise - Transform Your Life in 66 Days

A powerful habit-tracking and self-improvement app built with React Native and Expo, designed to help you build lasting habits and transform your life through scientific methods.

## ✨ Features

- 🎯 **66-Day Habit Formation Program** - Based on scientific research
- 🎮 **RPG-Style Progress Tracking** - Climb from Bronze V to Legend I
- 🌙 **Dark Theme Design** - Easy on the eyes, perfect for any time
- 📱 **Beautiful Onboarding Flow** - Personalized goal setting
- 📊 **Progress Analytics** - Track your habits and streaks
- 🔔 **Smart Notifications** - Stay motivated and on track
- 🎨 **Anime-Style Character** - Your personal transformation guide

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd RiseApp
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Run on your device**
   - **iOS**: Press `i` in the terminal or run `npm run ios`
   - **Android**: Press `a` in the terminal or run `npm run android`
   - **Physical Device**: Scan the QR code with Expo Go app

## 🎯 How It Works

### The 66-Day Challenge
Scientific research shows it takes approximately 66 days to form lasting habits. Rise guides you through this journey with:

- **Personalized Goal Setting** - Define what matters most to you
- **Daily Habit Tracking** - Monitor your progress with beautiful UI
- **Streak Maintenance** - Build momentum through consistency
- **Progress Visualization** - See your transformation in real-time

### Habit Categories
- **Sleep** - Optimize your rest and recovery
- **Water** - Stay hydrated throughout the day
- **Exercise** - Build strength and endurance
- **Mind** - Develop mental clarity and focus
- **Screen Time** - Reduce digital distractions
- **Cold Showers** - Build mental resilience

## 🎨 Design Philosophy

Rise uses a dark theme with:
- **Primary Color**: Orange (#FF6B35) - Represents energy and transformation
- **Secondary Color**: Purple (#8B5CF6) - Symbolizes wisdom and growth
- **Background**: Dark brown/black (#1A0F0F) - Creates focus and reduces eye strain
- **Anime Character**: Your personal guide through the transformation journey

## 📱 App Structure

```
RiseApp/
├── App.tsx                 # Main app component
├── src/
│   ├── components/         # UI components
│   │   ├── Onboarding.tsx # Multi-step onboarding flow
│   │   ├── Dashboard.tsx  # Main habit tracking interface
│   │   ├── Stats.tsx      # Progress analytics
│   │   └── Profile.tsx    # User settings and goals
│   ├── context/           # Theme and app context
│   ├── store/             # Redux state management
│   ├── services/          # Notification and data services
│   └── types/             # TypeScript type definitions
└── assets/                # Images and icons
```

## 🔧 Development

### Key Technologies
- **React Native** - Cross-platform mobile development
- **Expo** - Development tools and services
- **Redux Toolkit** - State management
- **TypeScript** - Type safety and better development experience

### Adding New Features
1. Create new components in `src/components/`
2. Update types in `src/types/index.ts`
3. Add state management in `src/store/slices/`
4. Update the main App.tsx navigation

## 📱 Building for Production

### Using Expo EAS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for production
eas build --platform ios
eas build --platform android
```

### App Store Deployment
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## 🎯 The Rise Philosophy

Rise is more than just a habit tracker - it's a complete life transformation system. The app combines:

- **Scientific Research** - Based on proven habit formation principles
- **Gamification** - RPG-style progression keeps you engaged
- **Personalization** - Tailored to your specific goals and lifestyle
- **Community** - Join others on their transformation journey

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Ready to transform your life? Start your 66-day journey with Rise today! 🚀**

*"The path has been revealed to you. Will you take the first step into the unknown, or remain at the gates of destiny?"* 