# Proguard rules for Charging Assistant
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
-dontwarn android.os.BatteryManager
