package com.telnor.gestorcontrasenas

import android.content.Intent
import android.util.Log
import io.flutter.embedding.android.FlutterFragmentActivity
import androidx.annotation.NonNull
import com.telnor.gestorcontrasenas.MainActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel


class SavePasswordActivity : FlutterFragmentActivity() {

    var requestPasswordDetails: String? = null

    private val CHANNEL = "passwordData"

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            CHANNEL
        ).setMethodCallHandler { call, result ->
            if (call.method == "getPasswordData") {
                val passwordData = getPasswordDetails()

                if (passwordData != null) {
//                    Log.d("PASSWORD DATA FROM KOTLIN AUTOFILL", passwordData);
//                    Log.d("PASSWORD DATA", passwordData.toString());
                    result.success(passwordData)
                } else {
                    result.error("UNAVAILABLE", "password data not available.", null)
                }
            } else {
                result.notImplemented()
            }
        }
    }

    override fun getDartEntrypointFunctionName(): String {
        Log.d("MYTAG", "SavePassword native-side: getDartEntrypointFunctionName ")
        intent.extras?.let {
            Log.d("MYTAG", "getDartEntrypointFunctionName full intent data: $it")
//            Log.d("====================================================================")
            Log.d("GET PASSWORD DATA", "getDartEntrypointFunctionName full intent data: $it")
            if (it.containsKey("AutofillMetadata")) {
                requestPasswordDetails = it.get("AutofillMetadata").toString()
                Log.e("MYTAG", "getDartEntrypointFunctionName: $requestPasswordDetails")
            } else {
                requestPasswordDetails = "Something went wrong"
            }
        } ?: run {
            requestPasswordDetails = "Something went wrong"
        }
        return "savePasswordEntryPoint"
    }

    fun goToActivity2() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    private fun getPasswordDetails(): String? {
        return requestPasswordDetails
    }

    override fun onStop() {
        super.onStop()
        Log.d("MYTAG", "=========>SavePasswordActivity stopped")
        finishAffinity()
    }

    override fun onDestroy() {
        Log.d("MYTAG", "=========>SavePasswordActivity destroyed")
        super.onDestroy()
    }
}