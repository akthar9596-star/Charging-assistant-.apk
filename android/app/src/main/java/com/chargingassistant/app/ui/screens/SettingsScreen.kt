package com.chargingassistant.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryAlert
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chargingassistant.app.R
import com.chargingassistant.app.data.AppSettings
import com.chargingassistant.app.ui.theme.Emerald500

@Composable
fun SettingsScreen(
    settings: AppSettings,
    onSettingsChanged: (AppSettings) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Text(
            text = stringResource(R.string.nav_settings),
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Text(
            text = "Alert preferences, sound, vibration, and language",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Section 1: Charging Alerts
        SettingsSectionHeader(title = stringResource(R.string.settings_section_alerts))

        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Full Charge Alert Toggle
                SettingsSwitchRow(
                    icon = Icons.Default.BatteryChargingFull,
                    title = stringResource(R.string.settings_full_charge_alert),
                    desc = stringResource(R.string.settings_full_charge_alert_desc),
                    checked = settings.isFullChargeAlertEnabled,
                    onCheckedChange = { onSettingsChanged(settings.copy(isFullChargeAlertEnabled = it)) }
                )

                if (settings.isFullChargeAlertEnabled) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "${stringResource(R.string.settings_full_charge_target)}: ${settings.fullChargeTargetPercent}%",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        listOf(80, 85, 90, 95, 100).forEach { pct ->
                            FilterChip(
                                selected = settings.fullChargeTargetPercent == pct,
                                onClick = { onSettingsChanged(settings.copy(fullChargeTargetPercent = pct)) },
                                label = { Text("$pct%") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Emerald500,
                                    selectedLabelColor = MaterialTheme.colorScheme.surface
                                )
                            )
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp))

                // Temperature Alert Toggle
                SettingsSwitchRow(
                    icon = Icons.Default.Thermostat,
                    title = stringResource(R.string.settings_temp_alert),
                    desc = stringResource(R.string.settings_temp_alert_desc),
                    checked = settings.isTempAlertEnabled,
                    onCheckedChange = { onSettingsChanged(settings.copy(isTempAlertEnabled = it)) }
                )

                if (settings.isTempAlertEnabled) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "${stringResource(R.string.settings_temp_limit)}: ${settings.maxTempCelsius.toInt()}°C",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Slider(
                        value = settings.maxTempCelsius,
                        onValueChange = { onSettingsChanged(settings.copy(maxTempCelsius = it)) },
                        valueRange = 38f..50f,
                        steps = 5,
                        colors = SliderDefaults.colors(
                            thumbColor = Emerald500,
                            activeTrackColor = Emerald500
                        )
                    )
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp))

                // Low Battery Alert Toggle
                SettingsSwitchRow(
                    icon = Icons.Default.BatteryAlert,
                    title = stringResource(R.string.settings_low_battery_alert),
                    desc = stringResource(R.string.settings_low_battery_alert_desc),
                    checked = settings.isLowBatteryAlertEnabled,
                    onCheckedChange = { onSettingsChanged(settings.copy(isLowBatteryAlertEnabled = it)) }
                )

                if (settings.isLowBatteryAlertEnabled) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "${stringResource(R.string.settings_low_battery_target)}: ${settings.lowBatteryTargetPercent}%",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        listOf(10, 15, 20, 25).forEach { pct ->
                            FilterChip(
                                selected = settings.lowBatteryTargetPercent == pct,
                                onClick = { onSettingsChanged(settings.copy(lowBatteryTargetPercent = pct)) },
                                label = { Text("$pct%") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Emerald500,
                                    selectedLabelColor = MaterialTheme.colorScheme.surface
                                )
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Section 2: Feedback & Notifications
        SettingsSectionHeader(title = stringResource(R.string.settings_section_feedback))

        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                SettingsSwitchRow(
                    icon = Icons.Default.VolumeUp,
                    title = stringResource(R.string.settings_sound),
                    desc = stringResource(R.string.settings_sound_desc),
                    checked = settings.isSoundEnabled,
                    onCheckedChange = { onSettingsChanged(settings.copy(isSoundEnabled = it)) }
                )

                HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp))

                SettingsSwitchRow(
                    icon = Icons.Default.Vibration,
                    title = stringResource(R.string.settings_vibration),
                    desc = stringResource(R.string.settings_vibration_desc),
                    checked = settings.isVibrationEnabled,
                    onCheckedChange = { onSettingsChanged(settings.copy(isVibrationEnabled = it)) }
                )

                HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp))

                SettingsSwitchRow(
                    icon = Icons.Default.Notifications,
                    title = stringResource(R.string.settings_persistent_notification),
                    desc = stringResource(R.string.settings_persistent_notification_desc),
                    checked = settings.isPersistentNotificationEnabled,
                    onCheckedChange = { onSettingsChanged(settings.copy(isPersistentNotificationEnabled = it)) }
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Section 3: Appearance & Language
        SettingsSectionHeader(title = stringResource(R.string.settings_section_appearance))

        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.DarkMode,
                        contentDescription = "Theme",
                        tint = Emerald500,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = stringResource(R.string.settings_theme),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    listOf("system" to R.string.settings_theme_system, "light" to R.string.settings_theme_light, "dark" to R.string.settings_theme_dark).forEach { (mode, strRes) ->
                        FilterChip(
                            selected = settings.themeMode == mode,
                            onClick = { onSettingsChanged(settings.copy(themeMode = mode)) },
                            label = { Text(stringResource(strRes)) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Emerald500,
                                selectedLabelColor = MaterialTheme.colorScheme.surface
                            )
                        )
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Language,
                        contentDescription = "Language",
                        tint = Emerald500,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = stringResource(R.string.settings_language),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    FilterChip(
                        selected = settings.language == "bn",
                        onClick = { onSettingsChanged(settings.copy(language = "bn")) },
                        label = { Text(stringResource(R.string.lang_bengali)) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Emerald500,
                            selectedLabelColor = MaterialTheme.colorScheme.surface
                        )
                    )
                    FilterChip(
                        selected = settings.language == "en",
                        onClick = { onSettingsChanged(settings.copy(language = "en")) },
                        label = { Text(stringResource(R.string.lang_english)) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Emerald500,
                            selectedLabelColor = MaterialTheme.colorScheme.surface
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Privacy note
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = "Privacy",
                    tint = Emerald500,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = stringResource(R.string.privacy_statement),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun SettingsSectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = Emerald500,
        modifier = Modifier.padding(bottom = 8.dp)
    )
}

@Composable
fun SettingsSwitchRow(
    icon: ImageVector,
    title: String,
    desc: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) },
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = Emerald500,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = desc,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 18.sp
                )
            }
        }
        Spacer(modifier = Modifier.width(12.dp))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Emerald500,
                checkedTrackColor = Emerald500.copy(alpha = 0.5f)
            )
        )
    }
}
