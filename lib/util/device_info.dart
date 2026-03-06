import 'dart:developer' as dev;
import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';

Future<String?> getDeviceId() async {
  try {
    final deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      final androidInfo = await deviceInfo.androidInfo;
      return androidInfo.id;
    } else if (Platform.isIOS) {
      final iosInfo = await deviceInfo.iosInfo;
      return iosInfo.identifierForVendor;
    }
    return null;
  } catch (err) {
    dev.log('$err: error from getDeviceId()');
    return null;
  }
}
