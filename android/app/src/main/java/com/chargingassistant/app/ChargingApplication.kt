package com.chargingassistant.app

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

            // Channel 1: Ongoing persistent charging status (Low importance to avoid sound disruption)
            val statusChannel = NotificationChannel(
                CHANNEL_STATUS_ID,
                getString(R.string.channel_status_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_status_desc)
                setShowBadge(false)
            }

            // Channel 2: High priority alerts (Full charge, overheat, low battery with sound & vibration)
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
}
