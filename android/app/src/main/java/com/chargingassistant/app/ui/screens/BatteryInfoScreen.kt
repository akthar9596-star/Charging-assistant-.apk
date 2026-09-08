package com.chargingassistant.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.Cable
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Percent
import androidx.compose.material.icons.filled.Power
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.chargingassistant.app.R
import com.chargingassistant.app.data.BatteryHealth
import com.chargingassistant.app.data.BatteryInfo
import com.chargingassistant.app.data.ChargingStatus
import com.chargingassistant.app.data.PlugType
import com.chargingassistant.app.ui.theme.Emerald500

@Composable
fun BatteryInfoScreen(
    batteryInfo: BatteryInfo,
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

    val healthText = when (batteryInfo.health) {
        BatteryHealth.GOOD -> stringResource(R.string.health_good)
        BatteryHealth.OVERHEAT -> stringResource(R.string.health_overheat)
        BatteryHealth.DEAD -> stringResource(R.string.health_dead)
        BatteryHealth.OVER_VOLTAGE -> stringResource(R.string.health_over_voltage)
        BatteryHealth.COLD -> stringResource(R.string.health_cold)
        BatteryHealth.UNSPECIFIED_FAILURE -> stringResource(R.string.health_unspecified)
        BatteryHealth.UNKNOWN -> stringResource(R.string.not_available)
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
            .padding(16.dp)
    ) {
        Text(
            text = stringResource(R.string.nav_battery_info),
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Text(
            text = "Hardware diagnostics and Android BatteryManager telemetry",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                InfoRow(
                    icon = Icons.Default.Percent,
                    label = "Battery Percentage",
                    value = "${batteryInfo.percentage}%",
                    isHighlight = true
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.BatteryChargingFull,
                    label = "Battery Status",
                    value = statusText
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.Favorite,
                    label = stringResource(R.string.metric_health),
                    value = healthText
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.Thermostat,
                    label = stringResource(R.string.metric_temperature),
                    value = String.format("%.1f °C", batteryInfo.temperatureCelsius)
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.ElectricBolt,
                    label = stringResource(R.string.metric_voltage),
                    value = String.format("%.2f V", batteryInfo.voltageVolts)
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.Power,
                    label = stringResource(R.string.metric_source),
                    value = plugText
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.Speed,
                    label = stringResource(R.string.metric_current),
                    value = if (batteryInfo.currentMicroAmperes != null) "${batteryInfo.currentMicroAmperes / 1000} mA" else stringResource(R.string.not_available)
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.Memory,
                    label = stringResource(R.string.metric_technology),
                    value = batteryInfo.technology ?: stringResource(R.string.not_available)
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                InfoRow(
                    icon = Icons.Default.Cable,
                    label = stringResource(R.string.metric_capacity),
                    value = if (batteryInfo.capacityMah != null) "${batteryInfo.capacityMah.toInt()} mAh" else stringResource(R.string.not_available)
                )
            }
        }
    }
}

@Composable
fun InfoRow(
    icon: ImageVector,
    label: String,
    value: String,
    isHighlight: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isHighlight) Emerald500 else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.size(12.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = if (isHighlight) FontWeight.Bold else FontWeight.Medium,
            color = if (isHighlight) Emerald500 else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
