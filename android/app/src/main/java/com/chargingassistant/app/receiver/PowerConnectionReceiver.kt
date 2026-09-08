package com.chargingassistant.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.chargingassistant.app.service.ChargingMonitoringService

class PowerConnectionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null) return
        when (intent?.action) {
            Intent.ACTION_POWER_CONNECTED,
            Intent.ACTION_POWER_DISCONNECTED -> {
                // Ensure foreground monitoring is active
                ChargingMonitoringService.startService(context)
            }
        }
    }
}
