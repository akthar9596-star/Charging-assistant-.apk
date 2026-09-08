package com.chargingassistant.app.data

enum class ChargingStatus {
    CHARGING,
    DISCHARGING,
    FULL,
    NOT_CHARGING,
    UNKNOWN
}

enum class PlugType {
    AC,
    USB,
    WIRELESS,
    NONE,
    UNKNOWN
}

enum class BatteryHealth {
    GOOD,
    OVERHEAT,
    DEAD,
    OVER_VOLTAGE,
    COLD,
    UNSPECIFIED_FAILURE,
    UNKNOWN
}

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
)
