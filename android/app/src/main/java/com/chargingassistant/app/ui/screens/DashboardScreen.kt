package com.chargingassistant.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ElectricMeter
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Power
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chargingassistant.app.R
import com.chargingassistant.app.data.AppSettings
import com.chargingassistant.app.data.BatteryHealth
import com.chargingassistant.app.data.BatteryInfo
import com.chargingassistant.app.data.ChargingStatus
import com.chargingassistant.app.data.PlugType
import com.chargingassistant.app.ui.components.CircularBatteryIndicator
import com.chargingassistant.app.ui.theme.Amber500
import com.chargingassistant.app.ui.theme.Cyan500
import com.chargingassistant.app.ui.theme.Emerald500
import com.chargingassistant.app.ui.theme.Rose500

@Composable
fun DashboardScreen(
    batteryInfo: BatteryInfo,
    settings: AppSettings,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    val statusText = when (batteryInfo.status) {
        ChargingStatus.CHARGING -> stringResource(R.string.status_charging)
        ChargingStatus.FULL -> stringResource(R.string.status_full)
        ChargingStatus.DISCHARGING -> stringResource(R.string.status_discharging)
        ChargingStatus.NOT_CHARGING -> stringResource(R.string.status_not_charging)
        ChargingStatus.UNKNOWN -> stringResource(R.string.status_unknown)
    }

    val plugText = when (batteryInfo.plugType) {
        PlugType.AC -> stringResource(R.string.source_ac)
        PlugType.USB -> stringResource(R.string.source_usb)
        PlugType.WIRELESS -> stringResource(R.string.source_wireless)
        PlugType.NONE -> stringResource(R.string.source_battery)
        PlugType.UNKNOWN -> stringResource(R.string.source_unknown)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Title Banner
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = stringResource(R.string.app_name),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = stringResource(R.string.tagline),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (batteryInfo.isCharging) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Emerald500.copy(alpha = 0.15f))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = plugText,
                        color = Emerald500,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Large Circular Battery Gauge
        CircularBatteryIndicator(
            percentage = batteryInfo.percentage,
            isCharging = batteryInfo.isCharging,
            statusText = statusText,
            plugType = batteryInfo.plugType,
            modifier = Modifier.padding(8.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Active Alert Summary Badge
        if (settings.isFullChargeAlertEnabled || settings.isTempAlertEnabled) {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.NotificationsActive,
                        contentDescription = "Alerts",
                        tint = Emerald500,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "${stringResource(R.string.settings_full_charge_alert)}: ${settings.fullChargeTargetPercent}% • Max: ${settings.maxTempCelsius}°C",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 2x2 Telemetry Grid
        Row(modifier = Modifier.fillMaxWidth()) {
            MetricCard(
                title = stringResource(R.string.metric_temperature),
                value = String.format("%.1f °C", batteryInfo.temperatureCelsius),
                icon = Icons.Default.Thermostat,
                accentColor = if (batteryInfo.temperatureCelsius >= settings.maxTempCelsius) Rose500 else Cyan500,
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(12.dp))
            MetricCard(
                title = stringResource(R.string.metric_voltage),
                value = String.format("%.2f V", batteryInfo.voltageVolts),
                icon = Icons.Default.ElectricMeter,
                accentColor = Amber500,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            val healthText = when (batteryInfo.health) {
                BatteryHealth.GOOD -> stringResource(R.string.health_good)
                BatteryHealth.OVERHEAT -> stringResource(R.string.health_overheat)
                BatteryHealth.DEAD -> stringResource(R.string.health_dead)
                BatteryHealth.OVER_VOLTAGE -> stringResource(R.string.health_over_voltage)
                BatteryHealth.COLD -> stringResource(R.string.health_cold)
                BatteryHealth.UNSPECIFIED_FAILURE -> stringResource(R.string.health_unspecified)
                BatteryHealth.UNKNOWN -> stringResource(R.string.not_available)
            }
            MetricCard(
                title = stringResource(R.string.metric_health),
                value = healthText,
                icon = Icons.Default.Favorite,
                accentColor = if (batteryInfo.health == BatteryHealth.GOOD) Emerald500 else Rose500,
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(12.dp))
            val currentText = if (batteryInfo.currentMicroAmperes != null) {
                "${batteryInfo.currentMicroAmperes / 1000} mA"
            } else {
                stringResource(R.string.not_available)
            }
            MetricCard(
                title = stringResource(R.string.metric_current),
                value = currentText,
                icon = Icons.Default.Speed,
                accentColor = Cyan500,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Safety note card
        Card(
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.Top
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Notice",
                    tint = Amber500,
                    modifier = Modifier.size(20.dp).padding(top = 2.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = stringResource(R.string.safety_disclaimer),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(accentColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = title,
                        tint = accentColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
