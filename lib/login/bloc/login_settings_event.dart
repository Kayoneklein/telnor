import 'package:equatable/equatable.dart';

abstract class LoginSettingsEvent extends Equatable {
  const LoginSettingsEvent();

  @override
  List<Object> get props => [];
}

/// Loading initial state finished
class LoginSettingsInitialized extends LoginSettingsEvent {
  const LoginSettingsInitialized({
    required this.isCustomServer,
    required this.customServerUrl,
  });

  final bool isCustomServer;
  final String customServerUrl;

  @override
  List<Object> get props => [isCustomServer, customServerUrl];
}

class ToggleLoginSettingIsLoading extends LoginSettingsEvent {
  const ToggleLoginSettingIsLoading({required this.isLoading});

  final bool isLoading;

  @override
  List<Object> get props => [isLoading];
}

/// User changed default/custom server setting
class ServerSelectionChanged extends LoginSettingsEvent {
  const ServerSelectionChanged({required this.isCustomServer});

  final bool isCustomServer;

  @override
  List<Object> get props => [isCustomServer];
}

/// User modified custom server URL
class CustomServerUrlChanged extends LoginSettingsEvent {
  const CustomServerUrlChanged({required this.url});

  final String url;

  @override
  List<Object> get props => [url];
}

/// User confirmed the changes
class ChangesConfirmed extends LoginSettingsEvent {}

/// User tries to discard the changes
class BackButtonPressed extends LoginSettingsEvent {}

/// User closed discard confirmation dialog
class DialogConfirmationReceived extends LoginSettingsEvent {
  const DialogConfirmationReceived({required this.isYes});

  final bool isYes;

  @override
  List<Object> get props => [isYes];
}

class InvalidServer extends LoginSettingsEvent {}

class ServerValidated extends LoginSettingsEvent {
  const ServerValidated({required this.serverUrl});

  final String serverUrl;

  @override
  List<Object> get props => [serverUrl];
}

class ConnectionError extends LoginSettingsEvent {
  const ConnectionError({this.errorMessage = ''});

  final String errorMessage;

  @override
  List<Object> get props => [errorMessage];
}
