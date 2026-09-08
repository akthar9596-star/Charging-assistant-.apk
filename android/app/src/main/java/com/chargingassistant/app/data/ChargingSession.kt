package com.chargingassistant.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "charging_sessions")
data class ChargingSession(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val startPercentage: Int,
    val endPercentage: Int,
    val plugType: String,
    val peakTemperature: Float
) {
    val durationMs: Long
        get() = maxOf(0L, endTimeMs - startTimeMs)

    val percentageGain: Int
        get() = maxOf(0, endPercentage - startPercentage)
}
