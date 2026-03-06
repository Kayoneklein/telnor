import 'package:equatable/equatable.dart';

import 'login_state.dart';

abstract class LoginEvent extends Equatable {
  const LoginEvent();

  @override
  List<Object?> get props => [];
}

/// User modified email field
class EmailChanged extends LoginEvent {
  const EmailChanged({required this.email});

  final String email;

  @override
  List<Object> get props => [email];
}

/// User modified password
class PasswordChanged extends LoginEvent {
  const PasswordChanged({required this.password});

  final String password;

  @override
  List<Object> get props => [password];
}

/// User pressed Show/Hide password button
class PasswordVisibilityChanged extends LoginEvent {}

/// User picked new value for auto-logout timer
class AutoLogoutValueChanged extends LoginEvent {
  const AutoLogoutValueChanged({required this.value});

  final AutoLogoutTimer value;

  @override
  List<Object> get props => [value];
}

/// It is known whether biometrics hardware is available on device
class BiometricsAvailableChanged extends LoginEvent {
  const BiometricsAvailableChanged({
    required this.enabled,
    required this.isDeviceSupported,
  });

  final bool enabled;
  final bool isDeviceSupported;

  @override
  List<Object> get props => [enabled, isDeviceSupported];
}

/// User changed value for biometrics checkbox
class BiometricsCheckedChanged extends LoginEvent {
  const BiometricsCheckedChanged({
    required this.checked,
  });

  final bool checked;

  @override
  List<Object> get props => [checked];
}

/// User submitted the form
class FormSubmitted extends LoginEvent {
  const FormSubmitted({this.pin});

  final String? pin;

  @override
  List<Object> get props => [pin ?? ''];
}

/// User submitted bio matrix the form
class FormSubmittedBioMatrix extends LoginEvent {
  const FormSubmittedBioMatrix({this.password, this.email, this.pin});

  final String? password;
  final String? email;
  final String? pin;

  @override
  List<Object> get props => [password ?? '', email ?? '', pin ?? ''];
}

class Login2faRequested extends LoginEvent {}

///Login process finished
class LoginResultReceived extends LoginEvent {
  const LoginResultReceived({
    required this.status,
    this.errorMessage = '',
  });

  final LoginStatus status;
  final String errorMessage;

  @override
  List<Object> get props => [status, errorMessage];
}

/// very first time login
class VeryFirstTimeLogin extends LoginEvent {
  @override
  List<Object?> get props => [];
}

class AutomaticallyChangeCustomUrl extends LoginEvent {
  const AutomaticallyChangeCustomUrl(this.isCustomServer);

  final bool isCustomServer;

  @override
  List<Object> get props => [isCustomServer];
}

/// User viewed the error message
class ErrorMessageViewed extends LoginEvent {}

class LoginIsLoading extends LoginEvent {
  const LoginIsLoading(this.isLoading);

  final bool isLoading;

  @override
  List<Object> get props => [isLoading];
}

class ChangeServer extends LoginEvent {
  const ChangeServer({required this.server, required this.isCustomServer});

  final bool isCustomServer;
  final String server;

  @override
  List<Object?> get props => [isCustomServer, server];
}

class CheckCustomDomain extends LoginEvent {}
