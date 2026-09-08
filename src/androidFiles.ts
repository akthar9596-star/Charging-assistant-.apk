export interface ProjectFile {
  path: string;
  name: string;
  language: string;
  category: 'config' | 'manifest' | 'code' | 'resources' | 'doc';
  content: string;
}

export const ANDROID_FILES: ProjectFile[] = [
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'doc',
    content: `# চার্জিং সহকারী (Charging Assistant) ⚡📱
**Smart Phone Battery & Charging Safety Assistant for Android**

Production-ready, open-source Android application built in Kotlin and Jetpack Compose.
Empowers users to monitor charging health, receive customizable full charge (80%, 85%, 90%, 95%, 100%) and temperature alerts, log charging cycles offline, and inspect hardware battery telemetry.

### Build APK Quick Guide
\`\`\`bash
# Build Debug APK
./gradlew assembleDebug

# Build Release APK
./gradlew assembleRelease
\`\`\`
Generated APK location: \`app/build/outputs/apk/debug/app-debug.apk\`
`
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'config',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ChargingAssistant"
include(":app")`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    language: 'kotlin',
    category: 'config',
    content: `// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}`
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    language: 'toml',
    category: 'config',
    content: `[versions]
agp = "8.7.3"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.12.01"
room = "2.6.1"
ksp = "2.0.21-1.0.28"
navigationCompose = "2.8.5"
materialIconsExtended = "1.7.6"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended", version.ref = "materialIconsExtended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'config',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.chargingassistant.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.chargingassistant.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        vectorDrawables.useSupportLibrary = true
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    debugImplementation(libs.androidx.ui.tooling)
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:name=".ChargingApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ChargingAssistant"
        tools:targetApi="35">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.ChargingAssistant">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.ChargingMonitoringService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Real-time battery charging safety and temperature alert monitoring" />
        </service>

        <receiver
            android:name=".receiver.BootCompletedReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>

        <receiver
            android:name=".receiver.PowerConnectionReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.ACTION_POWER_CONNECTED" />
                <action android:name="android.intent.action.ACTION_POWER_DISCONNECTED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>`
  },
  {
    path: 'app/src/main/res/values-bn/strings.xml',
    name: 'strings.xml (বাংলা)',
    language: 'xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">চার্জিং সহকারী</string>
    <string name="app_name_bengali">চার্জিং সহকারী</string>
    <string name="tagline">স্মার্ট ব্যাটারি ও চার্জিং মনিটর</string>

    <string name="nav_dashboard">ড্যাশবোর্ড</string>
    <string name="nav_battery_info">ব্যাটারি তথ্য</string>
    <string name="nav_history">চার্জিং ইতিহাস</string>
    <string name="nav_settings">সেটিংস</string>

    <string name="status_charging">চার্জ হচ্ছে</string>
    <string name="status_not_charging">চার্জ হচ্ছে না</string>
    <string name="status_full">সম্পূর্ণ চার্জ হয়েছে</string>
    <string name="status_discharging">ডিসচার্জ হচ্ছে</string>
    <string name="status_unknown">অজানা অবস্থা</string>

    <string name="source_ac">এসি ফাস্ট চার্জার</string>
    <string name="source_usb">ইউএসবি পোর্ট</string>
    <string name="source_wireless">ওয়্যারলেস চার্জার</string>
    <string name="source_battery">ব্যাটারি পাওয়ার</string>
    <string name="source_unknown">অজানা উৎস</string>

    <string name="metric_temperature">ব্যাটারি তাপমাত্রা</string>
    <string name="metric_voltage">ভোল্টেজ</string>
    <string name="metric_current">চার্জিং বিদ্যুৎ প্রবাহ</string>
    <string name="metric_health">ব্যাটারির স্বাস্থ্য</string>
    <string name="metric_technology">প্রযুক্তি</string>
    <string name="metric_capacity">আনুমানিক ধারণক্ষমতা</string>
    <string name="metric_source">চার্জিং সোর্স</string>
    <string name="not_available">এই ডিভাইসে উপলব্ধ নয়</string>

    <string name="health_good">ভালো অবস্থা (Good)</string>
    <string name="health_overheat">অতিরিক্ত গরম (Overheat)</string>
    <string name="health_dead">ত্রুটিপূর্ণ / ডেড</string>
    <string name="health_over_voltage">অতিরিক্ত ভোল্টেজ</string>
    <string name="health_cold">অত্যধিক ঠান্ডা</string>
    <string name="health_unspecified">অনির্দিষ্ট সমস্যা</string>

    <string name="channel_status_name">চার্জিং মনিটরিং</string>
    <string name="channel_status_desc">চলমান চার্জিং শতকরা ও স্থিতি প্রদর্শন করে</string>
    <string name="channel_alerts_name">নিরাপত্তা ও চার্জ অ্যালার্ট</string>
    <string name="channel_alerts_desc">ফুল চার্জ, অতি-উত্তাপ ও লো ব্যাটারি সতর্কতা</string>

    <string name="alert_full_charge_title">চার্জিং সীমা পূর্ণ হয়েছে!</string>
    <string name="alert_full_charge_msg">আপনার ফোনের চার্জ নির্ধারিত %1$d%% স্তরে পৌঁছেছে। ব্যাটারির দীর্ঘস্থায়ী সুরক্ষার জন্য চার্জার খুলে ফেলতে পারেন।</string>
    <string name="alert_temp_high_title">ব্যাটারি অতিরিক্ত গরম সতর্কতা!</string>
    <string name="alert_temp_high_msg">ফোনের ব্যাটারি অতিরিক্ত গরম হয়ে গেছে (%1$.1f°C)। অনুগ্রহ করে চার্জার খুলুন এবং ফোনটিকে ঠাণ্ডা হতে দিন।</string>
    <string name="alert_low_battery_title">লো ব্যাটারি সতর্কতা!</string>
    <string name="alert_low_battery_msg">ব্যাটারির চার্জ কমে %1$d%% হয়েছে। অনুগ্রহ করে ফোনটি চার্জে সংযুক্ত করুন।</string>

    <string name="settings_section_alerts">চার্জিং অ্যালার্টসমূহ</string>
    <string name="settings_full_charge_alert">ফুল চার্জ অ্যালার্ট</string>
    <string name="settings_full_charge_alert_desc">নির্বাচিত শতাংশে পৌঁছালে সাউন্ড ও নোটিফিকেশন অ্যালার্ট দিন</string>
    <string name="settings_full_charge_target">কাঙ্ক্ষিত চার্জের স্তর</string>
    <string name="settings_temp_alert">অতিরিক্ত তাপমাত্রা অ্যালার্ট</string>
    <string name="settings_temp_limit">সর্বোচ্চ তাপমাত্রা সীমা</string>
    <string name="settings_low_battery_alert">লো ব্যাটারি অ্যালার্ট</string>
    <string name="settings_low_battery_target">লো ব্যাটারি লেভেল</string>

    <string name="settings_section_feedback">অ্যালার্ট ফিডব্যাক</string>
    <string name="settings_sound">সাউন্ড অ্যালার্ট</string>
    <string name="settings_vibration">ভাইব্রেশন</string>
    <string name="settings_persistent_notification">চার্জিং নোটিফিকেশন</string>

    <string name="settings_section_appearance">চেহারা ও ভাষা</string>
    <string name="settings_theme">থিম</string>
    <string name="settings_theme_system">সিস্টেম ডিফল্ট</string>
    <string name="settings_theme_light">লাইট</string>
    <string name="settings_theme_dark">ডার্ক</string>
    <string name="settings_language">ভাষা নির্বাচন</string>
    <string name="lang_english">English (ইংরেজি)</string>
    <string name="lang_bengali">বাংলা</string>

    <string name="settings_section_privacy">গোপনীয়তা ও নিরাপত্তা</string>
    <string name="privacy_statement">সম্পূর্ণ অফলাইন এবং সুরক্ষিত। কোনো ব্যক্তিগত ডেটা বা ব্যাটারির তথ্য কোথাও পাঠানো হয় না।</string>
    <string name="safety_disclaimer">সতর্কতা: অ্যান্ড্রয়েড সিস্টেমের নিরাপত্তাজনিত কারণে কোনো অ্যাপ সরাসরি বৈদ্যুতিক চার্জিং বিচ্ছিন্ন করতে পারে না। অ্যাপটি আপনাকে সতর্কবার্তা দিয়ে চার্জার খুলতে স্মরণ করিয়ে দেয়।</string>

    <string name="history_title">চার্জিং ইতিহাস</string>
    <string name="history_empty">এখনো কোনো চার্জিং সেশন রেকর্ড হয়নি। চার্জার কানেক্ট করলেই রেকর্ড হওয়া শুরু হবে।</string>
    <string name="history_clear">ইতিহাস মুছে ফেলুন</string>
    <string name="history_clear_confirm">আপনি কি সমস্ত সংরক্ষিত চার্জিং ইতিহাস মুছে ফেলতে চান?</string>
</resources>`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml (English)',
    language: 'xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Charging Assistant</string>
    <string name="app_name_bengali">চার্জিং সহকারী</string>
    <string name="tagline">Smart Phone Battery &amp; Charging Manager</string>

    <string name="nav_dashboard">Dashboard</string>
    <string name="nav_battery_info">Battery Info</string>
    <string name="nav_history">History</string>
    <string name="nav_settings">Settings</string>

    <string name="status_charging">Charging</string>
    <string name="status_not_charging">Not Charging</string>
    <string name="status_full">Fully Charged</string>
    <string name="status_discharging">Discharging</string>
    <string name="status_unknown">Unknown</string>

    <string name="source_ac">AC Fast Charger</string>
    <string name="source_usb">USB Port</string>
    <string name="source_wireless">Wireless Charger</string>
    <string name="source_battery">Battery</string>
    <string name="source_unknown">Unknown Source</string>

    <string name="metric_temperature">Temperature</string>
    <string name="metric_voltage">Voltage</string>
    <string name="metric_current">Charging Current</string>
    <string name="metric_health">Health</string>
    <string name="metric_technology">Technology</string>
    <string name="metric_capacity">Estimated Capacity</string>
    <string name="metric_source">Charging Source</string>
    <string name="not_available">Not available on this device</string>

    <string name="health_good">Good Condition</string>
    <string name="health_overheat">Overheated</string>
    <string name="health_dead">Dead</string>
    <string name="health_over_voltage">Over Voltage</string>
    <string name="health_cold">Too Cold</string>
    <string name="health_unspecified">Unspecified Failure</string>

    <string name="alert_full_charge_title">Battery Charge Limit Reached!</string>
    <string name="alert_full_charge_msg">Your battery reached the target limit of %1$d%%. You may disconnect your charger to prolong battery lifespan.</string>
    <string name="alert_temp_high_title">Battery Overheat Warning!</string>
    <string name="alert_temp_high_msg">Battery temperature is high (%1$.1f°C). Please disconnect charger or let your phone cool down.</string>
    <string name="alert_low_battery_title">Low Battery Alert!</string>
    <string name="alert_low_battery_msg">Battery dropped to %1$d%%. Please plug in your charger soon.</string>

    <string name="settings_section_alerts">Charging Alerts</string>
    <string name="settings_full_charge_alert">Full Charge Alert</string>
    <string name="settings_full_charge_alert_desc">Notify when battery charges up to selected percentage</string>
    <string name="settings_full_charge_target">Target Charge Level</string>

    <string name="settings_temp_alert">High Temperature Alert</string>
    <string name="settings_temp_limit">Maximum Temperature</string>

    <string name="settings_low_battery_alert">Low Battery Alert</string>
    <string name="settings_low_battery_target">Low Battery Level</string>

    <string name="settings_section_feedback">Alert Feedback</string>
    <string name="settings_sound">Sound Alert</string>
    <string name="settings_vibration">Vibration</string>
    <string name="settings_persistent_notification">Charging Notification</string>

    <string name="settings_section_appearance">Appearance &amp; Language</string>
    <string name="settings_theme">Theme</string>
    <string name="settings_theme_system">System Default</string>
    <string name="settings_theme_light">Light</string>
    <string name="settings_theme_dark">Dark</string>
    <string name="settings_language">Language</string>
    <string name="lang_english">English</string>
    <string name="lang_bengali">বাংলা (Bengali)</string>

    <string name="settings_section_privacy">Privacy &amp; Safety</string>
    <string name="privacy_statement">100% Offline &amp; Private. Charging Assistant never collects personal data or battery metrics.</string>
    <string name="safety_disclaimer">Notice: Android apps cannot physically stop electric charging unless supported by specific device kernel firmware. This app provides audio and visual alerts to notify you to unplug.</string>

    <string name="history_title">Charging History</string>
    <string name="history_empty">No charging sessions logged yet. Plug in your charger to start recording.</string>
    <string name="history_clear">Clear History</string>
    <string name="history_clear_confirm">Are you sure you want to delete all charging logs?</string>
</resources>`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/ChargingApplication.kt',
    name: 'ChargingApplication.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

class ChargingApplication : Application() {

    companion object {
        const val CHANNEL_STATUS_ID = "charging_status_channel"
        const val CHANNEL_ALERTS_ID = "charging_alerts_channel"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val statusChannel = NotificationChannel(
                CHANNEL_STATUS_ID,
                getString(R.string.channel_status_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_status_desc)
                setShowBadge(false)
            }

            val alertChannel = NotificationChannel(
                CHANNEL_ALERTS_ID,
                getString(R.string.channel_alerts_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_alerts_desc)
                enableVibration(true)
                enableLights(true)
            }

            notificationManager.createNotificationChannel(statusChannel)
            notificationManager.createNotificationChannel(alertChannel)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.core.content.ContextCompat
import com.chargingassistant.app.data.AppDatabase
import com.chargingassistant.app.data.SettingsRepository
import com.chargingassistant.app.service.ChargingMonitoringService
import com.chargingassistant.app.ui.screens.*
import com.chargingassistant.app.ui.theme.*
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : ComponentActivity() {

    private lateinit var settingsRepo: SettingsRepository
    private lateinit var database: AppDatabase

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        settingsRepo = SettingsRepository(applicationContext)
        database = AppDatabase.getDatabase(applicationContext)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        ChargingMonitoringService.startService(this)

        setContent {
            val settings by settingsRepo.settings.collectAsState()
            val batteryInfo by ChargingMonitoringService.currentBatteryInfo.collectAsState()
            val historySessions by database.chargingHistoryDao().getAllSessions().collectAsState(initial = emptyList())
            val coroutineScope = rememberCoroutineScope()

            val isDark = when (settings.themeMode) {
                "light" -> false
                "dark" -> true
                else -> isSystemInDarkTheme()
            }

            applyAppLocale(settings.language)

            ChargingAssistantTheme(darkTheme = isDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var selectedTab by remember { mutableIntStateOf(0) }

                    Scaffold(
                        bottomBar = {
                            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                                NavigationBarItem(
                                    selected = selectedTab == 0,
                                    onClick = { selectedTab = 0 },
                                    icon = { Icon(Icons.Default.BatteryChargingFull, contentDescription = "Dashboard") },
                                    label = { Text(stringResource(R.string.nav_dashboard)) }
                                )
                                NavigationBarItem(
                                    selected = selectedTab == 1,
                                    onClick = { selectedTab = 1 },
                                    icon = { Icon(Icons.Default.Info, contentDescription = "Battery Info") },
                                    label = { Text(stringResource(R.string.nav_battery_info)) }
                                )
                                NavigationBarItem(
                                    selected = selectedTab == 2,
                                    onClick = { selectedTab = 2 },
                                    icon = { Icon(Icons.Default.History, contentDescription = "History") },
                                    label = { Text(stringResource(R.string.nav_history)) }
                                )
                                NavigationBarItem(
                                    selected = selectedTab == 3,
                                    onClick = { selectedTab = 3 },
                                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                    label = { Text(stringResource(R.string.nav_settings)) }
                                )
                            }
                        }
                    ) { innerPadding ->
                        when (selectedTab) {
                            0 -> DashboardScreen(batteryInfo, settings, Modifier.padding(innerPadding))
                            1 -> BatteryInfoScreen(batteryInfo, Modifier.padding(innerPadding))
                            2 -> ChargingHistoryScreen(historySessions, { coroutineScope.launch { database.chargingHistoryDao().clearAll() } }, Modifier.padding(innerPadding))
                            3 -> SettingsScreen(settings, { settingsRepo.updateSettings(it) }, Modifier.padding(innerPadding))
                        }
                    }
                }
            }
        }
    }

    private fun applyAppLocale(langCode: String) {
        val locale = if (langCode == "en") Locale.ENGLISH else Locale("bn")
        val config = resources.configuration
        if (config.locales[0] != locale) {
            Locale.setDefault(locale)
            config.setLocale(locale)
            resources.updateConfiguration(config, resources.displayMetrics)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/service/ChargingMonitoringService.kt',
    name: 'ChargingMonitoringService.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app.service

import android.app.*
import android.content.*
import android.content.pm.ServiceInfo
import android.media.RingtoneManager
import android.os.*
import androidx.core.app.NotificationCompat
import com.chargingassistant.app.*
import com.chargingassistant.app.data.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class ChargingMonitoringService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var settingsRepo: SettingsRepository
    private lateinit var database: AppDatabase

    private var activeSessionStartTime: Long? = null
    private var activeSessionStartPercent: Int? = null
    private var activeSessionPlugType: String = "AC"
    private var peakTempInSession: Float = 0f

    private var hasAlertedFullChargeForCurrentCycle = false
    private var hasAlertedHighTempForCurrentCycle = false
    private var hasAlertedLowBatteryForCurrentCycle = false

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == Intent.ACTION_BATTERY_CHANGED) {
                processBatteryUpdate(intent)
            }
        }
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val ALERT_NOTIFICATION_ID = 1002

        private val _currentBatteryInfo = MutableStateFlow(BatteryInfo())
        val currentBatteryInfo = _currentBatteryInfo.asStateFlow()

        fun startService(context: Context) {
            val intent = Intent(context, ChargingMonitoringService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        settingsRepo = SettingsRepository(applicationContext)
        database = AppDatabase.getDatabase(applicationContext)

        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        registerReceiver(batteryReceiver, filter)

        val notification = buildOngoingNotification(_currentBatteryInfo.value)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int = START_STICKY

    override fun onDestroy() {
        super.onDestroy()
        try { unregisterReceiver(batteryReceiver) } catch (_: Exception) {}
        endActiveSessionIfNeeded(_currentBatteryInfo.value.percentage)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun processBatteryUpdate(intent: Intent) {
        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
        val percent = if (level >= 0 && scale > 0) (level * 100) / scale else 0

        val rawStatus = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
        val isCharging = rawStatus == BatteryManager.BATTERY_STATUS_CHARGING || rawStatus == BatteryManager.BATTERY_STATUS_FULL

        val status = when (rawStatus) {
            BatteryManager.BATTERY_STATUS_CHARGING -> ChargingStatus.CHARGING
            BatteryManager.BATTERY_STATUS_FULL -> ChargingStatus.FULL
            BatteryManager.BATTERY_STATUS_DISCHARGING -> ChargingStatus.DISCHARGING
            BatteryManager.BATTERY_STATUS_NOT_CHARGING -> ChargingStatus.NOT_CHARGING
            else -> ChargingStatus.UNKNOWN
        }

        val plugged = intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)
        val plugType = when (plugged) {
            BatteryManager.BATTERY_PLUGGED_AC -> PlugType.AC
            BatteryManager.BATTERY_PLUGGED_USB -> PlugType.USB
            BatteryManager.BATTERY_PLUGGED_WIRELESS -> PlugType.WIRELESS
            0 -> PlugType.NONE
            else -> PlugType.UNKNOWN
        }

        val rawTemp = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0)
        val tempCelsius = rawTemp / 10.0f
        val rawVoltage = intent.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0)
        val voltageVolts = rawVoltage / 1000.0f

        val info = BatteryInfo(
            percentage = percent,
            isCharging = isCharging,
            status = status,
            plugType = plugType,
            temperatureCelsius = tempCelsius,
            voltageVolts = voltageVolts
        )
        _currentBatteryInfo.value = info

        handleSessionLifecycle(isCharging, percent, plugType.name, tempCelsius)
        checkAlertRules(info)
        updateOngoingNotification(info)
    }

    private fun handleSessionLifecycle(isCharging: Boolean, currentPercent: Int, plugTypeName: String, temp: Float) {
        if (isCharging) {
            if (activeSessionStartTime == null) {
                activeSessionStartTime = System.currentTimeMillis()
                activeSessionStartPercent = currentPercent
                activeSessionPlugType = plugTypeName
                peakTempInSession = temp
                hasAlertedFullChargeForCurrentCycle = false
            } else if (temp > peakTempInSession) {
                peakTempInSession = temp
            }
        } else {
            endActiveSessionIfNeeded(currentPercent)
        }
    }

    private fun endActiveSessionIfNeeded(currentPercent: Int) {
        val start = activeSessionStartTime
        val startPct = activeSessionStartPercent
        if (start != null && startPct != null) {
            val session = ChargingSession(
                startTimeMs = start,
                endTimeMs = System.currentTimeMillis(),
                startPercentage = startPct,
                endPercentage = currentPercent,
                plugType = activeSessionPlugType,
                peakTemperature = peakTempInSession
            )
            serviceScope.launch { database.chargingHistoryDao().insertSession(session) }
            activeSessionStartTime = null
            activeSessionStartPercent = null
        }
    }

    private fun checkAlertRules(info: BatteryInfo) {
        val settings = settingsRepo.settings.value

        // Full Charge Alert
        if (info.isCharging && settings.isFullChargeAlertEnabled) {
            if (info.percentage >= settings.fullChargeTargetPercent && !hasAlertedFullChargeForCurrentCycle) {
                hasAlertedFullChargeForCurrentCycle = true
                triggerAlert(
                    title = getString(R.string.alert_full_charge_title),
                    message = getString(R.string.alert_full_charge_msg, settings.fullChargeTargetPercent),
                    sound = settings.isSoundEnabled,
                    vibrate = settings.isVibrationEnabled
                )
            }
        }

        // Temperature Alert
        if (settings.isTempAlertEnabled) {
            if (info.temperatureCelsius >= settings.maxTempCelsius && !hasAlertedHighTempForCurrentCycle) {
                hasAlertedHighTempForCurrentCycle = true
                triggerAlert(
                    title = getString(R.string.alert_temp_high_title),
                    message = getString(R.string.alert_temp_high_msg, info.temperatureCelsius),
                    sound = settings.isSoundEnabled,
                    vibrate = settings.isVibrationEnabled
                )
            }
        }
    }

    private fun triggerAlert(title: String, message: String, sound: Boolean, vibrate: Boolean) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val builder = NotificationCompat.Builder(this, ChargingApplication.CHANNEL_ALERTS_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        notificationManager.notify(ALERT_NOTIFICATION_ID, builder.build())

        if (sound) {
            try {
                val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                RingtoneManager.getRingtone(applicationContext, soundUri)?.play()
            } catch (_: Exception) {}
        }

        if (vibrate) {
            try {
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 400, 200, 400), -1))
                }
            } catch (_: Exception) {}
        }
    }

    private fun updateOngoingNotification(info: BatteryInfo) {
        if (!settingsRepo.settings.value.isPersistentNotificationEnabled) return
        val notification = buildOngoingNotification(info)
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun buildOngoingNotification(info: BatteryInfo): Notification {
        val text = "\${info.percentage}% • \${info.plugType} • \${info.temperatureCelsius}°C"
        return NotificationCompat.Builder(this, ChargingApplication.CHANNEL_STATUS_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(getString(R.string.notification_charging_title))
            .setContentText(text)
            .setOngoing(true)
            .build()
    }
}`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/data/BatteryInfo.kt',
    name: 'BatteryInfo.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app.data

enum class ChargingStatus { CHARGING, DISCHARGING, FULL, NOT_CHARGING, UNKNOWN }
enum class PlugType { AC, USB, WIRELESS, NONE, UNKNOWN }
enum class BatteryHealth { GOOD, OVERHEAT, DEAD, OVER_VOLTAGE, COLD, UNSPECIFIED_FAILURE, UNKNOWN }

data class BatteryInfo(
    val percentage: Int = 0,
    val isCharging: Boolean = false,
    val status: ChargingStatus = ChargingStatus.UNKNOWN,
    val plugType: PlugType = PlugType.NONE,
    val temperatureCelsius: Float = 0.0f,
    val voltageVolts: Float = 0.0f,
    val currentMicroAmperes: Long? = null,
    val health: BatteryHealth = BatteryHealth.UNKNOWN,
    val technology: String? = null,
    val capacityMah: Double? = null,
    val timestamp: Long = System.currentTimeMillis()
)`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/data/ChargingSession.kt',
    name: 'ChargingSession.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "charging_sessions")
data class ChargingSession(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val startPercentage: Int,
    val endPercentage: Int,
    val plugType: String,
    val peakTemperature: Float
) {
    val durationMs: Long get() = maxOf(0L, endTimeMs - startTimeMs)
    val percentageGain: Int get() = maxOf(0, endPercentage - startPercentage)
}`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/data/AppDatabase.kt',
    name: 'AppDatabase.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ChargingHistoryDao {
    @Query("SELECT * FROM charging_sessions ORDER BY endTimeMs DESC")
    fun getAllSessions(): Flow<List<ChargingSession>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: ChargingSession): Long

    @Query("DELETE FROM charging_sessions")
    suspend fun clearAll()
}

@Database(entities = [ChargingSession::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun chargingHistoryDao(): ChargingHistoryDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, "charging_assistant_db")
                    .fallbackToDestructiveMigration().build().also { INSTANCE = it }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/data/SettingsRepository.kt',
    name: 'SettingsRepository.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AppSettings(
    val isFullChargeAlertEnabled: Boolean = true,
    val fullChargeTargetPercent: Int = 85,
    val isLowBatteryAlertEnabled: Boolean = true,
    val lowBatteryTargetPercent: Int = 20,
    val isTempAlertEnabled: Boolean = true,
    val maxTempCelsius: Float = 42.0f,
    val isSoundEnabled: Boolean = true,
    val isVibrationEnabled: Boolean = true,
    val isPersistentNotificationEnabled: Boolean = true,
    val themeMode: String = "system",
    val language: String = "bn"
)

class SettingsRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("charging_assistant_prefs", Context.MODE_PRIVATE)
    private val _settings = MutableStateFlow(loadSettings())
    val settings: StateFlow<AppSettings> = _settings.asStateFlow()

    private fun loadSettings(): AppSettings {
        return AppSettings(
            isFullChargeAlertEnabled = prefs.getBoolean("full_charge_alert", true),
            fullChargeTargetPercent = prefs.getInt("full_charge_target", 85),
            isLowBatteryAlertEnabled = prefs.getBoolean("low_battery_alert", true),
            lowBatteryTargetPercent = prefs.getInt("low_battery_target", 20),
            isTempAlertEnabled = prefs.getBoolean("temp_alert", true),
            maxTempCelsius = prefs.getFloat("max_temp", 42.0f),
            isSoundEnabled = prefs.getBoolean("sound_enabled", true),
            isVibrationEnabled = prefs.getBoolean("vibration_enabled", true),
            isPersistentNotificationEnabled = prefs.getBoolean("persistent_notification", true),
            themeMode = prefs.getString("theme_mode", "system") ?: "system",
            language = prefs.getString("language", "bn") ?: "bn"
        )
    }

    fun updateSettings(newSettings: AppSettings) {
        prefs.edit().apply {
            putBoolean("full_charge_alert", newSettings.isFullChargeAlertEnabled)
            putInt("full_charge_target", newSettings.fullChargeTargetPercent)
            putBoolean("low_battery_alert", newSettings.isLowBatteryAlertEnabled)
            putInt("low_battery_target", newSettings.lowBatteryTargetPercent)
            putBoolean("temp_alert", newSettings.isTempAlertEnabled)
            putFloat("max_temp", newSettings.maxTempCelsius)
            putBoolean("sound_enabled", newSettings.isSoundEnabled)
            putBoolean("vibration_enabled", newSettings.isVibrationEnabled)
            putBoolean("persistent_notification", newSettings.isPersistentNotificationEnabled)
            putString("theme_mode", newSettings.themeMode)
            putString("language", newSettings.language)
            apply()
        }
        _settings.value = newSettings
    }
}`
  },
  {
    path: 'app/src/main/java/com/chargingassistant/app/ui/screens/DashboardScreen.kt',
    name: 'DashboardScreen.kt',
    language: 'kotlin',
    category: 'code',
    content: `package com.chargingassistant.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.chargingassistant.app.R
import com.chargingassistant.app.data.*
import com.chargingassistant.app.ui.components.CircularBatteryIndicator

@Composable
fun DashboardScreen(
    batteryInfo: BatteryInfo,
    settings: AppSettings,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = stringResource(R.string.app_name), style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(20.dp))
        CircularBatteryIndicator(
            percentage = batteryInfo.percentage,
            isCharging = batteryInfo.isCharging,
            statusText = if (batteryInfo.isCharging) stringResource(R.string.status_charging) else stringResource(R.string.status_not_charging),
            plugType = batteryInfo.plugType
        )
    }
}`
  }
];
