This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# 📱 Social App

A full-featured **React Native social media application** with real-time chat, posts feed, notifications, and multilingual support.

---

## ✨ Features

### 🔐 Authentication

- **Email & Password** sign-up/login
- **Google Sign-In** integration
- Secure Firebase Authentication

### 📰 News Feed

- Create, view, and interact with posts
- Like and comment on posts
- **Search** across all posts and users
- Pull-to-refresh feed updates

### 💬 Real-Time Chat

- One-on-one messaging with **Firestore real-time sync**
- **Message actions**: Reply, Copy, Delete, React with emojis
- **Read receipts**: Sent, Delivered, Seen status
- **Voice messages** support
- Swipe-to-reply gesture
- WhatsApp-style reply previews

### 🔔 Push Notifications

- **FCM (Firebase Cloud Messaging)** for iOS & Android
- Cloud Functions trigger notifications on new messages
- In-app notification center with persistent storage
- Background & foreground notification handling

### 👤 Profile Management

- View your posts and saved posts
- Edit profile (name, avatar, bio)
- Privacy settings

### ⚙️ Settings

- **Multilingual support** (English / Arabic with RTL)
- Theme customization
- Account management
- App version & info

### 🔍 Global Search

- Search users, posts, and chats
- Real-time search results

---

## 🛠️ Tech Stack

| Category          | Technology                                           |
| ----------------- | ---------------------------------------------------- |
| **Framework**     | React Native 0.83                                    |
| **Language**      | TypeScript 5.8                                       |
| **Backend**       | Firebase (Auth, Firestore, Storage, Cloud Functions) |
| **Navigation**    | React Navigation 7                                   |
| **State**         | React Query (TanStack)                               |
| **Notifications** | FCM + Notifee                                        |
| **Real-time**     | Firestore snapshots                                  |
| **Storage**       | AsyncStorage                                         |
| **Icons**         | React Native Vector Icons                            |
| **Animations**    | Reanimated 4                                         |
| **i18n**          | react-i18next                                        |

---

## 📦 Installation

### Prerequisites

- **Node.js**: 18 or 20 (for app) / 18 (for Cloud Functions)
- **Xcode** (macOS only, for iOS builds)
- **Android Studio** (for Android builds)
- **CocoaPods** (iOS dependency manager)
- **Firebase CLI** (for deploying Cloud Functions)

### 1️⃣ Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd socialApp
npm install
```

### 2️⃣ iOS Setup (macOS only)

```bash
# Install Ruby dependencies (CocoaPods)
bundle install

# Install iOS native dependencies
cd ios
bundle exec pod install
cd ..
```

### 3️⃣ Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google Sign-In)
3. Enable **Firestore Database**
4. Enable **Cloud Storage**
5. Enable **Cloud Messaging** (FCM)
6. Download configuration files:
   - **Android**: `google-services.json` → `android/app/`
   - **iOS**: `GoogleService-Info.plist` → `ios/socialApp/`

### 4️⃣ iOS APNs Setup (for push notifications)

1. In Apple Developer Portal, create an **APNs Authentication Key** (.p8)
2. Upload it to Firebase Console → **Project Settings → Cloud Messaging → iOS app**
3. Open `ios/socialApp.xcworkspace` in Xcode
4. Enable capabilities:
   - ✅ **Push Notifications**
   - ✅ **Background Modes** → Remote notifications

### 5️⃣ Deploy Cloud Functions (for notifications)

```bash
# Install Firebase CLI
npm install -g firebase-tools
# or use npx: npx firebase-tools <command>

# Login
firebase login

# Set your Firebase project
firebase use <your-project-id>

# Install function dependencies
cd functions
nvm use 18  # Switch to Node 18 (required by Cloud Functions)
npm install
npm run build
cd ..

# Deploy
firebase deploy --only functions
```

---

## 🚀 Running the App

### Start Metro Bundler

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

---

## 📚 Key Packages

| Package                            | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| `@react-native-firebase/app`       | Firebase core SDK                                       |
| `@react-native-firebase/auth`      | Authentication                                          |
| `@react-native-firebase/firestore` | Real-time database                                      |
| `@react-native-firebase/messaging` | Push notifications (FCM)                                |
| `@react-native-firebase/storage`   | File uploads (images, audio)                            |
| `@notifee/react-native`            | Local notifications (Android channels, iOS banners)     |
| `react-native-permissions`         | Runtime permissions (camera, microphone, notifications) |
| `react-i18next` + `i18next`        | Multilingual support                                    |
| `react-native-reanimated`          | Smooth animations                                       |
| `react-native-gesture-handler`     | Swipe gestures (reply, actions)                         |
| `react-native-vector-icons`        | Icon library                                            |
| `@react-navigation/native`         | App navigation                                          |
| `@tanstack/react-query`            | Data fetching & caching                                 |
| `react-native-image-picker`        | Photo/video picker                                      |
| `react-native-sound`               | Audio playback                                          |

---

## 🗂️ Project Structure

```
socialApp/
├── src/
│   ├── app/
│   │   ├── navigation/          # Navigation setup
│   │   ├── screens/
│   │   │   ├── Auth/            # Login, SignUp
│   │   │   ├── Chat/            # Chat screen, hooks, services
│   │   │   ├── Feed/            # News feed & posts
│   │   │   ├── Notifications/   # Notification center
│   │   │   ├── Profile/         # User profile
│   │   │   ├── Search/          # Global search
│   │   │   └── Settings/        # App settings
│   ├── components/              # Reusable UI components
│   ├── hooks/                   # Custom hooks (auth, notifications)
│   ├── localization/            # i18n translations
│   ├── theme/                   # Colors, typography, spacing
│   └── utils/                   # Helper functions
├── functions/                   # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts             # Message notification trigger
│   ├── package.json
│   └── tsconfig.json
├── android/                     # Android native code
├── ios/                         # iOS native code
├── firebase.json                # Firebase config
├── .firebaserc                  # Firebase project ID
└── package.json
```

---

## 🔧 Configuration

### Firebase Collections

Your Firestore should have these collections:

```
users/
  {userId}/
    - name: string
    - imgUrl: string
    - username: string
    - fcmTokens: string[]  // for push notifications

chats/
  {chatId}/
    - members: string[]    // [userId1, userId2]
    - lastMessage: object
    - updatedAt: timestamp

    messages/
      {messageId}/
        - senderId: string
        - text: string
        - createdAt: timestamp
        - deleted: boolean
        - reactions: object
        - replyTo: object (optional)
        - status: object     // delivered/seen tracking

posts/
  {postId}/
    - userId: string
    - text: string
    - mediaUrl: string (optional)
    - likes: number
    - createdAt: timestamp
```

### Environment Variables (optional)

For sensitive keys, create `.env`:

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
```

---

## 🌍 Multilingual Support

The app supports **English** and **Arabic** with automatic RTL layout.

- Translations: `src/localization/`
- Change language: **Settings → Language**

---

## 🔔 How Notifications Work

1. **User A** sends a message to **User B**
2. Cloud Function (`notifyNewChatMessage`) triggers
3. Function reads User A's `name` and `imgUrl` from Firestore
4. Function reads User B's `fcmTokens` array
5. FCM push sent to User B with:
   - `notification`: { title: User A name, body: message text }
   - `data`: { chatId, senderId, avatar, ... }
6. App receives push:
   - **Foreground**: shows banner via Notifee + saves to AsyncStorage
   - **Background**: Android/iOS system shows notification

---

## 🐛 Troubleshooting

### Android notifications not working

- Verify `android.permission.POST_NOTIFICATIONS` in `AndroidManifest.xml`
- For Android 13+, accept permission prompt when app first runs
- Check FCM token is saved to Firestore (`users/{uid}/fcmTokens`)

### iOS notifications not working

- Ensure APNs key is uploaded to Firebase Console
- Enable **Push Notifications** + **Background Modes** in Xcode
- Check iOS permission prompt appears (delete app and reinstall if denied)

### Icons not showing on Android

```bash
# Copy icon fonts to assets
mkdir -p assets/fonts
cp -R node_modules/react-native-vector-icons/Fonts/* assets/fonts/
npx react-native-asset

# Clean rebuild
cd android && ./gradlew clean && cd ..
npm run android
```

### Cloud Functions deploy fails (HTTP 429)

- Wait 5–10 minutes and retry
- Quota limit on enabling APIs (temporary Google Cloud throttle)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📧 Support

For issues or questions:

- Open a GitHub issue
- Email: support@yourapp.com

---

**Built with ♥ by Your Name**
