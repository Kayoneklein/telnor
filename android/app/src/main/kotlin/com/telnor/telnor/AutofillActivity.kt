package com.telnor.gestorcontrasenas

import android.util.Log
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import io.github.oshai.kotlinlogging.KotlinLogging

private val logger = KotlinLogging.logger {}

class AutofillActivity : FlutterFragmentActivity() {
//    private val logger = Logger.getLogger(this.javaClass.name)

    var parentAppDetails: String? = null
    private val autofillCHANNEL = "appData"

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            autofillCHANNEL
        ).setMethodCallHandler { call, result ->
            if (call.method == "getAppData") {
                val appData = getAppDetails()

                logger.info { "appData from the autofill service" };
                logger.info { appData };

                if (appData != null) {
                    result.success(appData)
                } else {
                    result.error("UNAVAILABLE", "app data not available.", null)
                }
            } else {
                result.notImplemented()
            }
        }
    }

    override fun getDartEntrypointFunctionName(): String {
        Log.d("MYTAG", "AutofillActivity native-side: getDartEntrypointFunctionName ")
        intent.extras?.let {
            Log.d("MYTAG", "getDartEntrypointFunctionName full intent data: $it")
            if (it.containsKey("AutofillMetadata")) {
                parentAppDetails = it.get("AutofillMetadata").toString()
                Log.e("MYTAG", "autofillEntryPoint: $parentAppDetails")
            } else {
                parentAppDetails = "Something went wrong"
            }
        } ?: run {
            parentAppDetails = "Something went wrong"
        }
        return "autofillEntryPoint"
    }

    private fun getAppDetails(): String? {
        return parentAppDetails
    }

    override fun onDestroy() {
        Log.d("MYTAG", "=========>AutofillActivity destroyed")
        super.onDestroy()
    }
}