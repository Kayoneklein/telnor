import 'package:shared_preferences/shared_preferences.dart';
import 'package:telnor/util/settings.dart';

class Preferences {
  Future<SharedPreferences> get _sharedPreferences =>
      SharedPreferences.getInstance();

  Future<String?> get currentServer async =>
      (await _sharedPreferences).getString('web_server');

  Future<bool?> get isFromAutofill async =>
      (await _sharedPreferences).getBool(Settings.IS_FROM_AUTO_FILL_REQUEST);

  Future<bool?> get firstTimeLoginServer async => (await _sharedPreferences)
      .getBool(Settings.IS_LOGIN_VERY_FIRST_TIME_SERVER);

  Future<String?> get latestEmail async =>
      (await _sharedPreferences).getString(Settings.LOGIN_LATEST_EMAIL);

  Future<String?> get autoLogout async =>
      (await _sharedPreferences).getString(Settings.LOGIN_AUTO_LOGOUT);

  Future<bool?> get biometricCheckbox async =>
      (await _sharedPreferences).getBool(Settings.LOGIN_BIOMETRICS_CHECKBOX);

  Future<bool> get isCustomServer async =>
      (await _sharedPreferences).getBool(Settings.LOGIN_IS_CUSTOM_SERVER) ??
      false;

  Future<String?> get customServerUrl async =>
      (await _sharedPreferences).getString(Settings.LOGIN_CUSTOM_SERVER_URL);

  ///TWO FACTOR PREFERENCES
  Future<String?> get twoFAKey async =>
      (await _sharedPreferences).getString(Settings.twoFaSecKey);

  Future<String?> get deviceId async =>
      (await _sharedPreferences).getString(Settings.deviceId);

  Future<String?> get twoFaAuthToken async =>
      (await _sharedPreferences).getString(Settings.twoFaAuthToken);

  ///READ-ONLY  PREFERENCES
  Future<bool?> get readonlyMode async =>
      (await _sharedPreferences).getBool(Settings.readonlyMode);

  Future<String?> get localAppVersion async =>
      (await _sharedPreferences).getString(Settings.LOCAL_APP_VERSION);
}
