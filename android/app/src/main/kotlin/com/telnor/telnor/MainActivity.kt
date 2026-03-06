package com.telnor.gestorcontrasenas

import io.flutter.embedding.android.FlutterFragmentActivity
import android.os.Bundle
import com.google.android.material.color.DynamicColors

class MainActivity : FlutterFragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Apply dynamic colors to the application
        DynamicColors.applyToActivitiesIfAvailable(application)
    }
}
