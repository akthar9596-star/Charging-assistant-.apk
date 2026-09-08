# চার্জিং সহকারী (Charging Assistant) ⚡📱
**Smart Phone Battery & Charging Safety Assistant for Android**

![Platform](https://img.shields.io/badge/Platform-Android_8.0+_(API_26-35)-3DDC84?style=flat&logo=android)
![Language](https://img.shields.io/badge/Language-Kotlin_2.0-7F52FF?style=flat&logo=kotlin)
![UI](https://img.shields.io/badge/UI-Jetpack_Compose_Material_3-4285F4?style=flat)
![Database](https://img.shields.io/badge/Storage-Room_SQLite_(Offline)-009688?style=flat)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)

“**চার্জিং সহকারী**” (Charging Assistant) is a modern, production-ready, open-source Android application built entirely in Kotlin and Jetpack Compose. It empowers users to monitor charging health, receive customizable full charge (80%, 85%, 90%, 95%, 100%) and temperature alerts to protect battery longevity, log charging cycles offline, and inspect hardware battery telemetry.

---

## 🌟 Key Features

1. **Circular Live Battery Dashboard**:
   - Real-time battery percentage with smooth animations
   - Dynamic charging indicator (AC Fast Charger, USB, Wireless, or Battery)
   - Live temperature (°C), voltage (V), charging current (mA), and health status
   - Quick indicators for user-configured alert limits

2. **Smart Charging & Safety Alerts**:
   - **Full Charge Alert**: Select 80%, 85%, 90%, 95%, or 100% target limits to prolong lithium-ion battery health.
   - **High Temperature Warning**: Custom safety threshold (38°C to 50°C) with audio and vibration alerts.
   - **Low Battery Alert**: Customizable alerts at 10%, 15%, 20%, or 25%.
   - **Customizable Feedback**: Toggle audio tones, vibration patterns, and persistent notifications independently.

3. **Background Foreground Service**:
   - Continues monitoring seamlessly when the app is minimized or the screen is turned off.
   - Modern Android 14+ compatible `specialUse` foreground service type.
   - Dynamic persistent notification showing current %, charging status, and temperature.

4. **Charging History Log**:
   - Stores charging sessions locally using Room Database.
   - Records start time, end time, starting %, ending %, percentage gained (+%), peak temperature, and duration.
   - Clean, chronological history list with 1-tap clear confirmation.

5. **Detailed Battery Diagnostics**:
   - Battery level, status, health condition, temperature, voltage, technology, and charging source.
   - Displays *"Not available on this device"* for proprietary or unsupported hardware properties.

6. **Bilingual & Theming**:
   - Full native **বাংলা (Bengali)** and **English** localization.
   - Dynamic **Dark Theme**, **Light Theme**, and System Default.
   - 100% Offline & Private: No telemetry collection, zero third-party ads, no cloud uploads.

---

## 🛠️ Tech Stack & Architecture

- **Language**: Kotlin 2.0.21
- **Target SDK**: Android 15 (API 35) | **Min SDK**: Android 8.0 Oreo (API 26)
- **UI Framework**: Jetpack Compose with Material Design 3
- **Architecture**: Single-Activity Architecture, MVVM with Kotlin Coroutines & `StateFlow`
- **Local Persistence**: AndroidX Room Database & SharedPreferences
- **Background Execution**: Android Foreground Service, BroadcastReceiver (`ACTION_BATTERY_CHANGED`, `ACTION_POWER_CONNECTED`, `ACTION_POWER_DISCONNECTED`, `ACTION_BOOT_COMPLETED`)

---

## 🚀 How to Build the APK in Android Studio

### 1. Prerequisites
- **Android Studio** (Ladybug 2024.2.1, Iguana, Hedgehog, or newer)
- **JDK 17** (bundled with Android Studio)
- Android SDK Build Tools (API 35 installed via SDK Manager)

### 2. Opening the Project
1. Clone or extract the project directory to your computer.
2. Launch **Android Studio**.
3. Click **File > Open...** and navigate to the project directory (select the `android` folder or root where `settings.gradle.kts` is located).
4. Wait for Android Studio to index the project.

### 3. Syncing Gradle
1. Android Studio will usually prompt to sync automatically.
2. If not, click the **Sync Project with Gradle Files** button (elephant icon with blue arrow) in the top toolbar.
3. Verify that the build status in the bottom bar displays *"BUILD SUCCESSFUL"*.

### 4. Building Debug APK
To build and test the debug APK:
- **Via Android Studio GUI**: Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
- **Via Terminal**:
  ```bash
  # On Linux / macOS
  ./gradlew assembleDebug

  # On Windows PowerShell or CMD
  .\gradlew.bat assembleDebug
  ```

### 5. Finding the Generated Debug APK
Once built, find your APK at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```
You can transfer this `.apk` to any Android 8.0+ smartphone and install it directly!

### 6. Building a Signed Release APK
To create an optimized, signed release APK ready for distribution or Google Play:

1. In Android Studio, go to **Build > Generate Signed Bundle / APK...**
2. Select **APK** and click **Next**.
3. Under **Key store path**, click **Create new...** if you don't have a keystore:
   - Choose a file destination (e.g. `charging-assistant-key.jks`).
   - Enter password and alias details.
4. Click **Next**, choose destination folder, and select build variant **release**.
5. Check both **V1 (Jar Signature)** and **V2 (Full APK Signature)** check-boxes.
6. Click **Finish**. The signed APK will be generated under:
   ```text
   android/app/release/app-release.apk
   ```

---

## 📦 Publishing to GitHub & Creating a Release

### 1. Initialize Git Repository & Push
```bash
git init
git add .
git commit -m "Initial release of Charging Assistant (চার্জিং সহকারী) v1.0.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/charging-assistant.git
git push -u origin main
```

### 2. Create a GitHub Release with the APK
1. Open your repository on GitHub.
2. On the right sidebar, click **Releases > Create a new release** (or **Draft a new release**).
3. Click **Choose a tag**, type `v1.0.0`, and click **Create new tag: v1.0.0 on publish**.
4. Set Release title: `চার্জিং সহকারী (Charging Assistant) v1.0.0`.
5. In the description, paste release notes highlighting features (Bengali & English support, 80-100% full charge alerts, overheat alert, charging history).
6. Drag and drop your generated `app-release.apk` into the **Attach binaries by dropping them here or selecting them** box.
7. Click **Publish release**.

---

## 🔒 Permissions & Privacy Statement

| Permission | Reason |
|---|---|
| `POST_NOTIFICATIONS` | Required on Android 13+ to deliver full charge, low battery, and overheat notifications. |
| `FOREGROUND_SERVICE` | Keeps monitoring alive when the phone screen is locked or app is in background. |
| `FOREGROUND_SERVICE_SPECIAL_USE` | Complies with Android 14+ foreground service categorization. |
| `VIBRATE` | Provides tactile vibration alerts during critical battery temperature or target charge events. |
| `RECEIVE_BOOT_COMPLETED` | Automatically resumes battery monitoring service when device restarts. |

> **Hardware Disclaimer**: Android system architecture does not permit third-party applications to physically disconnect electric current from entering the battery charging controller without proprietary vendor hardware APIs. The app acts as an active assistant alerting the user with audio tones and notifications to disconnect the charger.

---

## 📄 License
Licensed under the Apache License, Version 2.0. Open source and free for all users.
