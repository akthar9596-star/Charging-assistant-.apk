package com.chargingassistant.app

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
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.core.content.ContextCompat
import com.chargingassistant.app.data.AppDatabase
import com.chargingassistant.app.data.SettingsRepository
import com.chargingassistant.app.service.ChargingMonitoringService
import com.chargingassistant.app.ui.screens.BatteryInfoScreen
import com.chargingassistant.app.ui.screens.ChargingHistoryScreen
import com.chargingassistant.app.ui.screens.DashboardScreen
import com.chargingassistant.app.ui.screens.SettingsScreen
import com.chargingassistant.app.ui.theme.ChargingAssistantTheme
import com.chargingassistant.app.ui.theme.Emerald500
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : ComponentActivity() {

    private lateinit var settingsRepo: SettingsRepository
    private lateinit var database: AppDatabase

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Notification permission granted or denied
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        settingsRepo = SettingsRepository(applicationContext)
        database = AppDatabase.getDatabase(applicationContext)

        // Request POST_NOTIFICATIONS on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        // Start background battery monitoring foreground service
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

            // Apply selected locale configuration
            applyAppLocale(settings.language)

            ChargingAssistantTheme(darkTheme = isDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var selectedTab by remember { mutableIntStateOf(0) }

                    Scaffold(
                        bottomBar = {
                            NavigationBar(
                                containerColor = MaterialTheme.colorScheme.surface
                            ) {
                                NavigationBarItem(
                                    selected = selectedTab == 0,
                                    onClick = { selectedTab = 0 },
                                    icon = { Icon(Icons.Default.BatteryChargingFull, contentDescription = "Dashboard") },
                                    label = { Text(stringResource(R.string.nav_dashboard)) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = Emerald500,
                                        selectedTextColor = Emerald500,
                                        indicatorColor = Emerald500.copy(alpha = 0.15f)
                                    )
                                )
                                NavigationBarItem(
                                    selected = selectedTab == 1,
                                    onClick = { selectedTab = 1 },
                                    icon = { Icon(Icons.Default.Info, contentDescription = "Battery Info") },
                                    label = { Text(stringResource(R.string.nav_battery_info)) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = Emerald500,
                                        selectedTextColor = Emerald500,
                                        indicatorColor = Emerald500.copy(alpha = 0.15f)
                                    )
                                )
                                NavigationBarItem(
                                    selected = selectedTab == 2,
                                    onClick = { selectedTab = 2 },
                                    icon = { Icon(Icons.Default.History, contentDescription = "History") },
                                    label = { Text(stringResource(R.string.nav_history)) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = Emerald500,
                                        selectedTextColor = Emerald500,
                                        indicatorColor = Emerald500.copy(alpha = 0.15f)
                                    )
                                )
                                NavigationBarItem(
                                    selected = selectedTab == 3,
                                    onClick = { selectedTab = 3 },
                                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                    label = { Text(stringResource(R.string.nav_settings)) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = Emerald500,
                                        selectedTextColor = Emerald500,
                                        indicatorColor = Emerald500.copy(alpha = 0.15f)
                                    )
                                )
                            }
                        }
                    ) { innerPadding ->
                        when (selectedTab) {
                            0 -> DashboardScreen(
                                batteryInfo = batteryInfo,
                                settings = settings,
                                modifier = Modifier.padding(innerPadding)
                            )
                            1 -> BatteryInfoScreen(
                                batteryInfo = batteryInfo,
                                modifier = Modifier.padding(innerPadding)
                            )
                            2 -> ChargingHistoryScreen(
                                sessions = historySessions,
                                onClearHistory = {
                                    coroutineScope.launch {
                                        database.chargingHistoryDao().clearAll()
                                    }
                                },
                                modifier = Modifier.padding(innerPadding)
                            )
                            3 -> SettingsScreen(
                                settings = settings,
                                onSettingsChanged = { newSettings ->
                                    settingsRepo.updateSettings(newSettings)
                                },
                                modifier = Modifier.padding(innerPadding)
                            )
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
}
