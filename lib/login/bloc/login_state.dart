import 'package:equatable/equatable.dart';

/// Various phases of login process
enum LoginStatus {
  none,
  success,
  pinCodeRequired,
  unknownUser,
  invalidPassword,
  emailNotVerified,
  otherError,
}

/// Constants for various location expiration periods
enum AutoLogoutTimer { never, min2, min5, min10, min15, min30, hour1, hour4 }

class LoginState extends Equatable {
  const LoginState({
    required this.isLoading,
    required this.email,
    required this.isEmailValid,
    required this.password,
    required this.isPasswordVisible,
    required this.isPasswordValid,
    required this.loginStatus,
    required this.errorMessage,
    required this.autoLogoutValues,
    required this.autoLogout,
    required this.biometricsAvailable,
    required this.biometricsChecked,
    required this.isType2fa,
    required this.veryFirstTimeLogin,
    required this.isDeviceSupported,
    required this.isCustomServer,
  });

  factory LoginState.initial() => const LoginState(
    isLoading: false,
    email: '',
    isEmailValid: true,
    password: '',
    isPasswordVisible: false,
    isPasswordValid: true,
    loginStatus: LoginStatus.none,
    errorMessage: '',
    autoLogoutValues: AutoLogoutTimer.values,
    autoLogout: AutoLogoutTimer.never,
    biometricsAvailable: false,
    isDeviceSupported: false,
    biometricsChecked: false,
    isType2fa: false,
    veryFirstTimeLogin: false,
    isCustomServer: false,
    // serverUrl: WebProvider.DEFAULT_SERVER,
  );

  final bool isLoading;
  final String email;
  final bool isEmailValid;
  final String password;
  final bool isPasswordVisible;
  final bool isPasswordValid;
  final LoginStatus loginStatus;
  final String errorMessage;
  final List<AutoLogoutTimer> autoLogoutValues;
  final AutoLogoutTimer autoLogout;
  final bool biometricsAvailable;
  final bool biometricsChecked;
  final bool isType2fa;
  final bool veryFirstTimeLogin;
  final bool isDeviceSupported;

  // final String serverUrl;
  final bool isCustomServer;

  LoginState copyWith({
    bool? isLoading,
    bool? isCustomServer,
    String? email,
    bool? isEmailValid,
    String? password,
    bool? isPasswordVisible,
    bool? isPasswordValid,
    LoginStatus? loginStatus,
    String? errorMessage,
    List<AutoLogoutTimer>? autoLogoutValues,
    AutoLogoutTimer? autoLogout,
    bool? biometricsAvailable,
    bool? biometricsChecked,
    bool? isType2fa,
    bool? veryFirstTimeLogin,
    bool? isDeviceSupported,
  }) => LoginState(
    isLoading: isLoading ?? this.isLoading,
    isCustomServer: isCustomServer ?? this.isCustomServer,
    email: email ?? this.email,
    isEmailValid: isEmailValid ?? this.isEmailValid,
    password: password ?? this.password,
    isPasswordVisible: isPasswordVisible ?? this.isPasswordVisible,
    isPasswordValid: isPasswordValid ?? this.isPasswordValid,
    loginStatus: loginStatus ?? this.loginStatus,
    errorMessage: errorMessage ?? this.errorMessage,
    autoLogoutValues: autoLogoutValues ?? this.autoLogoutValues,
    autoLogout: autoLogout ?? this.autoLogout,
    biometricsAvailable: biometricsAvailable ?? this.biometricsAvailable,
    biometricsChecked: biometricsChecked ?? this.biometricsChecked,
    isType2fa: isType2fa ?? this.isType2fa,
    veryFirstTimeLogin: veryFirstTimeLogin ?? this.veryFirstTimeLogin,
    isDeviceSupported: isDeviceSupported ?? this.isDeviceSupported,
  );

  @override
  List<Object?> get props => [
    isLoading,
    email,
    isEmailValid,
    password,
    isPasswordVisible,
    isPasswordValid,
    loginStatus,
    errorMessage,
    autoLogoutValues,
    autoLogout,
    biometricsAvailable,
    biometricsChecked,
    isType2fa,
    veryFirstTimeLogin,
    isCustomServer,
    isDeviceSupported,
  ];
}

/// Helper method to convert [AutoLogoutTimer] values to minutes
int autoLogoutTimerToMinutes(AutoLogoutTimer value) {
  switch (value) {
    case AutoLogoutTimer.never:
      return 0;
    case AutoLogoutTimer.min2:
      return 2;
    case AutoLogoutTimer.min5:
      return 5;
    case AutoLogoutTimer.min10:
      return 10;
    case AutoLogoutTimer.min15:
      return 15;
    case AutoLogoutTimer.min30:
      return 30;
    case AutoLogoutTimer.hour1:
      return 60;
    case AutoLogoutTimer.hour4:
      return 240;
  }
}
