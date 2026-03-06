import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")

if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    namespace = "com.telnor.gestorcontrasenas"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    sourceSets {
        getByName("main") {
            java.srcDir("src/main/kotlin")
        }
    }

    lint {
        disable.add("InvalidPackage")
    }

    defaultConfig {
       applicationId = "com.telnor.gestorcontrasenas"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = 29
        targetSdk = 36
        versionCode = flutter.versionCode
        versionName = flutter.versionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        multiDexEnabled = true
    }

//    signingConfigs {
//        create("release") {
//            keyAlias = keystoreProperties["keyAlias"] as String
//            keyPassword = keystoreProperties["keyPassword"] as String
//
//            storeFile = keystoreProperties["storeFile"]?.let {
//                file(it as String)
//            }
//
//            storePassword = keystoreProperties["storePassword"] as String
//        }
//    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
//           signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true

            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )

        }
    }

    packaging {
        jniLibs {
            pickFirsts += listOf(
                "lib/x86/libc++_shared.so",
                "lib/x86_64/libc++_shared.so",
                "lib/armeabi-v7a/libc++_shared.so",
                "lib/arm64-v8a/libc++_shared.so"
            )
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    testImplementation("junit:junit:5.10.2")

    implementation("androidx.multidex:multidex:2.0.0")

    androidTestImplementation("androidx.test:runner:1.5.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")

    api("androidx.core:core-ktx:1.16.0")

    implementation("io.github.oshai:kotlin-logging-jvm:7.0.13")
    implementation("com.google.android.material:material:1.12.0")
}