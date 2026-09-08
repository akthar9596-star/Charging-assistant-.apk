package com.chargingassistant.app.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AppSettings(
    val isFullChargeAlertEnabled: Boolean = true,
    val fullChargeTargetPercent: Int = 85, // 80, 85, 90, 95, 100
    val isLowBatteryAlertEnabled: Boolean = true,
    val lowBatteryTargetPercent: Int = 20, // 10, 15, 20, 25
    val isTempAlertEnabled: Boolean = true,
    val maxTempCelsius: Float = 42.0f,
    val isSoundEnabled: Boolean = true,
    val isVibrationEnabled: Boolean = true,
    val isPersistentNotificationEnabled: Boolean = true,
    val themeMode: String = "system", // "system", "light", "dark"
    val language: String = "bn" // "system", "en", "bn"
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
}
