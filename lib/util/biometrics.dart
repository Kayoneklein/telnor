import 'package:local_auth/local_auth.dart';
import 'package:local_auth_android/local_auth_android.dart';
import 'package:local_auth_darwin/local_auth_darwin.dart';
import 'package:telnor/util/strings.dart';

///Class which performs authorization based on biometrics
class BiometricsService {
  BiometricsService._() {
    initialization = _initialize();
  }

  static final BiometricsService get = BiometricsService._();

  late final Future<void> initialization;

  //--------------------------------------------------------------------------------------------------------------------

  final _localAuth = LocalAuthentication();
  List<BiometricType> _availableBiometrics = [];
  bool _canCheckBiometrics = false;
  bool _isDeviceSupported = false;

  bool get canCheckBiometrics =>
      _canCheckBiometrics && _availableBiometrics.isNotEmpty;

  bool get isDeviceSupported => _isDeviceSupported;

  ///Initialize biometrics service
  Future<void> _initialize() async {
    _canCheckBiometrics = await _localAuth.canCheckBiometrics;
    _availableBiometrics = await _localAuth.getAvailableBiometrics();
    _isDeviceSupported = await _localAuth.isDeviceSupported();
  }

  Future<bool> checkDeviceSupported() async {
    _isDeviceSupported = await _localAuth.isDeviceSupported();
    return _isDeviceSupported;
  }

  ///Authorize using biometrics
  Future<bool> authorize() async {
    try {
      return await _localAuth.authenticate(
        localizedReason: Strings.biometricLockPrompt,
        authMessages: <AuthMessages>[
          AndroidAuthMessages(
            cancelButton: Strings.actionCancel,
            signInTitle: Strings.biometricLockTitle,
            signInHint: Strings.biometricLockTitle,
            // biometricSuccess: Strings.biometricLockSuccess,
            // biometricNotRecognized: Strings.biometricLockFailure,
            // biometricHint: '',
          ),
          IOSAuthMessages(
            cancelButton: Strings.actionCancel,
            // lockOut: Strings.biometricLockTitle,
          ),
        ],
        // options: const AuthenticationOptions(
        //   stickyAuth: true,
        // ),
      );
    } catch (error) {
      return false;
    }
  }
}
