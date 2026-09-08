package com.chargingassistant.app.service

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.chargingassistant.app.ChargingApplication
import com.chargingassistant.app.MainActivity
import com.chargingassistant.app.R
import com.chargingassistant.app.data.AppDatabase
import com.chargingassistant.app.data.BatteryHealth
import com.chargingassistant.app.data.BatteryInfo
import com.chargingassistant.app.data.ChargingSession
import com.chargingassistant.app.data.ChargingStatus
import com.chargingassistant.app.data.PlugType
import com.chargingassistant.app.data.SettingsRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ChargingMonitoringService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var settingsRepo: SettingsRepository
    private lateinit var database: AppDatabase

    // Session tracking
    private var activeSessionStartTime: Long? = null
    private var activeSessionStartPercent: Int? = null
    private var activeSessionPlugType: String = "AC"
    private var peakTempInSession: Float = 0f

    // Alert state to prevent repeat spamming in the same state
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

        fun stopService(context: Context) {
            val intent = Intent(context, ChargingMonitoringService::class.java)
            context.stopService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        settingsRepo = SettingsRepository(applicationContext)
        database = AppDatabase.getDatabase(applicationContext)

        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        registerReceiver(batteryReceiver, filter)

        startForegroundNotification()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(batteryReceiver)
        } catch (_: Exception) {}
        endActiveSessionIfNeeded(_currentBatteryInfo.value.percentage)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startForegroundNotification() {
        val notification = buildOngoingNotification(_currentBatteryInfo.value)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun processBatteryUpdate(intent: Intent) {
        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
        val percent = if (level >= 0 && scale > 0) (level * 100) / scale else 0

        val rawStatus = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
        val isCharging = rawStatus == BatteryManager.BATTERY_STATUS_CHARGING ||
                rawStatus == BatteryManager.BATTERY_STATUS_FULL

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

        val rawHealth = intent.getIntExtra(BatteryManager.EXTRA_HEALTH, -1)
        val health = when (rawHealth) {
            BatteryManager.BATTERY_HEALTH_GOOD -> BatteryHealth.GOOD
            BatteryManager.BATTERY_HEALTH_OVERHEAT -> BatteryHealth.OVERHEAT
            BatteryManager.BATTERY_HEALTH_DEAD -> BatteryHealth.DEAD
            BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> BatteryHealth.OVER_VOLTAGE
            BatteryManager.BATTERY_HEALTH_COLD -> BatteryHealth.COLD
            BatteryManager.BATTERY_HEALTH_UNSPECIFIED_FAILURE -> BatteryHealth.UNSPECIFIED_FAILURE
            else -> BatteryHealth.UNKNOWN
        }

        val technology = intent.getStringExtra(BatteryManager.EXTRA_TECHNOLOGY)

        // Read current microamperes if supported
        val batteryManager = getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        val currentMicroAmperes = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            batteryManager?.getLongProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW)?.takeIf { it != Long.MIN_VALUE }
        } else null

        val info = BatteryInfo(
            percentage = percent,
            isCharging = isCharging,
            status = status,
            plugType = plugType,
            temperatureCelsius = tempCelsius,
            voltageVolts = voltageVolts,
            currentMicroAmperes = currentMicroAmperes,
            health = health,
            technology = technology
        )
        _currentBatteryInfo.value = info

        handleSessionLifecycle(isCharging, percent, plugType.name, tempCelsius)
        checkAlertRules(info)
        updateOngoingNotification(info)
    }

    private fun handleSessionLifecycle(isCharging: Boolean, currentPercent: Int, plugTypeName: String, temp: Float) {
        if (isCharging) {
            if (activeSessionStartTime == null) {
                // New charging session initiated
                activeSessionStartTime = System.currentTimeMillis()
                activeSessionStartPercent = currentPercent
                activeSessionPlugType = plugTypeName
                peakTempInSession = temp
                hasAlertedFullChargeForCurrentCycle = false
            } else {
                if (temp > peakTempInSession) {
                    peakTempInSession = temp
                }
            }
        } else {
            endActiveSessionIfNeeded(currentPercent)
        }
    }

    private fun endActiveSessionIfNeeded(currentPercent: Int) {
        val start = activeSessionStartTime
        val startPct = activeSessionStartPercent
        if (start != null && startPct != null) {
            val end = System.currentTimeMillis()
            val session = ChargingSession(
                startTimeMs = start,
                endTimeMs = end,
                startPercentage = startPct,
                endPercentage = currentPercent,
                plugType = activeSessionPlugType,
                peakTemperature = peakTempInSession
            )
            serviceScope.launch {
                database.chargingHistoryDao().insertSession(session)
            }
            activeSessionStartTime = null
            activeSessionStartPercent = null
            peakTempInSession = 0f
            hasAlertedFullChargeForCurrentCycle = false
        }
    }

    private fun checkAlertRules(info: BatteryInfo) {
        val settings = settingsRepo.settings.value

        // 1. Full charge target alert
        if (info.isCharging && settings.isFullChargeAlertEnabled) {
            if (info.percentage >= settings.fullChargeTargetPercent) {
                if (!hasAlertedFullChargeForCurrentCycle) {
                    hasAlertedFullChargeForCurrentCycle = true
                    triggerAlert(
                        title = getString(R.string.alert_full_charge_title),
                        message = getString(R.string.alert_full_charge_msg, settings.fullChargeTargetPercent),
                        sound = settings.isSoundEnabled,
                        vibrate = settings.isVibrationEnabled
                    )
                }
            } else {
                // If dropped below target (e.g. unplugged and re-plugged), reset alert flag
                if (info.percentage < settings.fullChargeTargetPercent - 2) {
                    hasAlertedFullChargeForCurrentCycle = false
                }
            }
        }

        // 2. High temperature alert
        if (settings.isTempAlertEnabled) {
            if (info.temperatureCelsius >= settings.maxTempCelsius) {
                if (!hasAlertedHighTempForCurrentCycle) {
                    hasAlertedHighTempForCurrentCycle = true
                    triggerAlert(
                        title = getString(R.string.alert_temp_high_title),
                        message = getString(R.string.alert_temp_high_msg, info.temperatureCelsius),
                        sound = settings.isSoundEnabled,
                        vibrate = settings.isVibrationEnabled
                    )
                }
            } else if (info.temperatureCelsius <= settings.maxTempCelsius - 2.0f) {
                hasAlertedHighTempForCurrentCycle = false
            }
        }

        // 3. Low battery alert
        if (!info.isCharging && settings.isLowBatteryAlertEnabled) {
            if (info.percentage <= settings.lowBatteryTargetPercent) {
                if (!hasAlertedLowBatteryForCurrentCycle) {
                    hasAlertedLowBatteryForCurrentCycle = true
                    triggerAlert(
                        title = getString(R.string.alert_low_battery_title),
                        message = getString(R.string.alert_low_battery_msg, settings.lowBatteryTargetPercent),
                        sound = settings.isSoundEnabled,
                        vibrate = settings.isVibrationEnabled
                    )
                }
            } else if (info.percentage > settings.lowBatteryTargetPercent + 5) {
                hasAlertedLowBatteryForCurrentCycle = false
            }
        }
    }

    private fun triggerAlert(title: String, message: String, sound: Boolean, vibrate: Boolean) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, ChargingApplication.CHANNEL_ALERTS_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        notificationManager.notify(ALERT_NOTIFICATION_ID, builder.build())

        if (sound) {
            try {
                val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                val ringtone = RingtoneManager.getRingtone(applicationContext, soundUri)
                ringtone?.play()
            } catch (_: Exception) {}
        }

        if (vibrate) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                    val vibrator = vibratorManager.defaultVibrator
                    val effect = VibrationEffect.createWaveform(longArrayOf(0, 400, 200, 400), -1)
                    vibrator.vibrate(effect)
                } else {
                    @Suppress("DEPRECATION")
                    val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        val effect = VibrationEffect.createWaveform(longArrayOf(0, 400, 200, 400), -1)
                        vibrator.vibrate(effect)
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(longArrayOf(0, 400, 200, 400), -1)
                    }
                }
            } catch (_: Exception) {}
        }
    }

    private fun updateOngoingNotification(info: BatteryInfo) {
        val settings = settingsRepo.settings.value
        if (!settings.isPersistentNotificationEnabled) {
            return
        }
        val notification = buildOngoingNotification(info)
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun buildOngoingNotification(info: BatteryInfo): Notification {
        val openIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val statusText = when (info.plugType) {
            PlugType.AC -> getString(R.string.source_ac)
            PlugType.USB -> getString(R.string.source_usb)
            PlugType.WIRELESS -> getString(R.string.source_wireless)
            else -> if (info.isCharging) getString(R.string.status_charging) else getString(R.string.status_not_charging)
        }

        val text = getString(
            R.string.notification_charging_text,
            info.percentage,
            statusText,
            info.temperatureCelsius
        )

        return NotificationCompat.Builder(this, ChargingApplication.CHANNEL_STATUS_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(getString(R.string.notification_charging_title))
            .setContentText(text)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(pendingIntent)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .build()
    }
}
