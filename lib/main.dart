import 'dart:async';

import 'package:auto_hyphenating_text/auto_hyphenating_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:privacy_screen/privacy_screen.dart';
import 'package:telnor/app.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/config/configuration_bloc.dart';
import 'package:telnor/delete_account/index.dart';
import 'package:telnor/login/bloc/login_bloc.dart';
import 'package:telnor/login/bloc/login_settings_bloc.dart';
import 'package:telnor/util/device_info.dart';
import 'package:telnor/util/encrypt.dart';
import 'package:telnor/util/settings.dart';

void main() async {
  runZonedGuarded<Future<void>>(() async {
    await initGeneralSetup();
    _runApp();
  }, (error, stack) {});
}

@pragma('vm:entry-point')
Future<void> autofillEntryPoint() async {
  await initGeneralSetup(fromAutofill: true, fromSavePass: false);
  _runApp();
}

@pragma('vm:entry-point')
Future<void> savePasswordEntryPoint() async {
  await initGeneralSetup(fromAutofill: false, fromSavePass: true);
  _runApp();
}

Future<void> _saveDeviceId() async {
  final deviceId = await getDeviceId();
  final encryptedDeviceId = Encryption().encrypt(deviceId ?? '');
  await Settings.get.setString(Settings.deviceId, encryptedDeviceId);
}

Future<void> _enablePrivacyScreen() async {
  await PrivacyScreen.instance.enable(
    iosOptions: const PrivacyIosOptions(enablePrivacy: true),
    androidOptions: const PrivacyAndroidOptions(enableSecure: true),
    backgroundColor: Colors.white.withAlpha(0),
    blurEffect: PrivacyBlurEffect.extraLight,
  );
}

Future<void> initGeneralSetup({
  bool fromAutofill = false,
  bool fromSavePass = false,
}) async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await initHyphenation();

  final Settings settings = Settings.get;

  await settings.setBoolean(Settings.IS_FROM_AUTO_FILL_REQUEST, fromAutofill);
  await settings.setBoolean(Settings.IS_FROM_SAVE_PASSWORD, fromSavePass);
  await _saveDeviceId();

  await _enablePrivacyScreen();
}

void _runApp() {
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider<AuthenticationBloc>(
          create: (context) => AuthenticationBloc()..add(AppStartedEvent()),
        ),
        BlocProvider<ConfigurationBloc>(
          create: (context) => ConfigurationBloc(),
        ),
        BlocProvider<LoginBloc>(create: (context) => LoginBloc()),
        BlocProvider<LoginSettingsBloc>(
          create: (context) => LoginSettingsBloc(),
        ),
        BlocProvider<DeleteAccountBloc>(
          create: (context) => DeleteAccountBloc(),
        ),
      ],
      child: PCryptApp(),
    ),
  );
}
