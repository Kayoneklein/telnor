import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:telnor/model/user.dart';

//tdo await Settings.get.getB(Settings.FORCE_UPDATE_COURSES_DONE)
class Settings {
  Settings._();

  static final Settings get = Settings._();

  Future<SharedPreferences> get _settings => SharedPreferences.getInstance();

  static const IS_LOGGED_IN = 'is_logged_in';
  static const IS_LOCATION_DENIED = 'is_location_denied';
  static const IS_NOT_FIRST_RUN = 'is_not_first_run';
  static const IS_BIOMETRICS_ENABLED = 'is_biometrics_enabled';

  static const CURRENT_USER = 'current_user';

  static const LOGIN_IS_CUSTOM_SERVER = 'login_is_custom_server';
  static const LOGIN_CUSTOM_SERVER_URL = 'login_custom_server_url';
  static const LOGIN_SESSION_DURATION = 'login_session_duration';
  static const LOGIN_SESSION_LAST_ACTIVE = 'sessionLastActive';
  static const LOGIN_LATEST_EMAIL = 'login_latest_email';

  // static const LOGIN_LATEST_PASSWORD = 'login_latest_password';
  static const LOGIN_AUTO_LOGOUT = 'login_auto_logout';
  static const LOGIN_BIOMETRICS_CHECKBOX = 'login_biometrics_checkbox';
  static const LOGOUT_DUE_TO_BIO_AUTH = 'logout_due_to_bio_auth';
  static const IS_FROM_AUTO_FILL_REQUEST = 'is_from_auto_fill_request';
  static const IS_LOADING_PASSWORD_FOR_AUTOFILL_UPDATE =
      'is_loading_password_for_autofill_update';
  static const IS_FROM_SAVE_PASSWORD = 'is_from_save_password';
  static const IS_LOGIN_VERY_FIRST_TIME_SETTING =
      'is_login_very_first_time_setting';
  static const IS_LOGIN_VERY_FIRST_TIME_SERVER =
      'is_login_very_first_time_server';
  static const IS_LOGIN_VERY_FIRST_TIME = 'is_login_very_first_time';
  static const String kPasswordsPrefKey = 'passwords_pref';

  ///TWO FACTOR AUTH PREFERENCES
  static const String twoFaSecKey = 'two_fa_sec_key';
  static const String twoFaAuthToken = 'two_fa_auth_token';
  static const String deviceId = 'deviceId';

  static const String readonlyMode = 'read_only_mode';

  static const String LOCAL_APP_VERSION = 'app_version';

  Future<String?> getString(String key) async {
    return (await _settings).getString(key);
  }

  Future<void> setString(String key, String value) async {
    (await _settings).setString(key, value);
  }

  Future<bool> getBoolean(String key) async {
    bool? value = (await _settings).getBool(key);
    value ??= false;
    return value;
  }

  Future<void> setBoolean(String key, bool value) async {
    (await _settings).setBool(key, value);
  }

  Future<int> getInteger(String key) async {
    int? value = (await _settings).getInt(key);
    value ??= 0;
    return value;
  }

  Future<void> setInteger(String key, int value) async {
    (await _settings).setInt(key, value);
  }

  Future<void> setDouble(String key, double value) async {
    (await _settings).setDouble(key, value);
  }

  Future<double> getDouble(String key) async {
    double? value = (await _settings).getDouble(key);
    value ??= 0;
    return value;
  }

  Future<void> saveStringList(String key, List<String> value) async {
    (await _settings).setStringList(key, value);
  }

  Future<List<String>?> getStringList(String key) async {
    final value = (await _settings).getStringList(key);
    return value;
  }

  Future<void> delete(String key) async {
    await (await _settings).remove(key);
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Convenience method to check [IS_LOGGED_IN] flag
  Future<bool> isLoggedIn() => getBoolean(IS_LOGGED_IN);

  /// Convenience method to set [IS_LOGGED_IN] flag
  Future<void> setLoggedIn() => setBoolean(IS_LOGGED_IN, true);

  /// Convenience method to reset [IS_LOGGED_IN] flag
  Future<void> setLoggedOut() => setBoolean(IS_LOGGED_IN, false);

  /// Convenience method to get [CURRENT_USER] property
  Future<User> getCurrentUser() async =>
      User.fromJson(jsonDecode(await getString(CURRENT_USER) ?? ''));

  /// Convenience method to set [CURRENT_USER] property
  Future<void> setCurrentUser(User user) async =>
      await setString(CURRENT_USER, jsonEncode(user.toJson()));
}
