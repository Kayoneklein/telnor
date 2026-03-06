import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:telnor/constants/global_variables.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/web/local_db_service.dart';

///THIS IS A CUSTOM MANAGEMENT OF APP FILES AND OTHER CACHED DATA WITHIN THE APP
///THIS SOLVES MOST OF THE PROBLEMS SURROUNDING PRESERVED STATE AND APP DATA WHEN THE APPLICATION IS UPDATED ON A DEVICE
///THIS FIXES AN iOS BUG OBSERVED AND REPORTED
///DATE: December 12, 2025

Future<void> _clearSharedPreferences() async {
  final pref = await SharedPreferences.getInstance();
  await pref.clear();
}

Future<void> _clearFlutterSecureStorage() async {
  const storage = FlutterSecureStorage();
  await storage.deleteAll();
}

Future<void> _deleteLocalDB() async {
  await LocalDBService.db.deleteAppDatabase();
}

Future<void> checkAppVersionCompatibility() async {
  final pref = Preferences();
  final appLocalVersion = await pref.localAppVersion;

  if (appLocalVersion != appVersion) {
    await _clearSharedPreferences();
    await _clearFlutterSecureStorage();
    await _deleteLocalDB();
  }
}
