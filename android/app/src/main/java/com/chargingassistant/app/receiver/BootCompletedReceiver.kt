package com.chargingassistant.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.chargingassistant.app.service.ChargingMonitoringService

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null) return
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED ||
            intent?.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            ChargingMonitoringService.startService(context)
        }
    }
}
