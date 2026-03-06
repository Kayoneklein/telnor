import 'package:equatable/equatable.dart';

class LoginSettingsState extends Equatable {
  const LoginSettingsState({
    required this.isInitialized,
    required this.isLoading,
    required this.isCustomServer,
    required this.customServerUrl,
    required this.isCustomServerUrlValid,
  });

  factory LoginSettingsState.initial() => const LoginSettingsState(
        isInitialized: false,
        isLoading: true,
        isCustomServer: false,
        customServerUrl: '',
        isCustomServerUrlValid: true,
      );

  final bool isInitialized;
  final bool isLoading;
  final bool isCustomServer;
  final String customServerUrl;
  final bool isCustomServerUrlValid;

  LoginSettingsState copyWith({
    bool? isInitialized,
    bool? isLoading,
    bool? isCustomServer,
    String? customServerUrl,
    bool? isCustomServerUrlValid,
  }) =>
      LoginSettingsState(
        isInitialized: isInitialized ?? this.isInitialized,
        isLoading: isLoading ?? this.isLoading,
        isCustomServer: isCustomServer ?? this.isCustomServer,
        customServerUrl: customServerUrl ?? this.customServerUrl,
        isCustomServerUrlValid:
            isCustomServerUrlValid ?? this.isCustomServerUrlValid,
      );

  @override
  List<Object> get props => [
        isInitialized,
        isLoading,
        isCustomServer,
        customServerUrl,
        isCustomServerUrlValid,
      ];
}

/// State to indicate the need to show confirmation dialog
class ShowDiscardDialogState extends LoginSettingsState {
  ShowDiscardDialogState(LoginSettingsState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          isCustomServer: state.isCustomServer,
          customServerUrl: state.customServerUrl,
          isCustomServerUrlValid: state.isCustomServerUrlValid,
        );
}

/// State to indicate the need to go back
class NavigateBackState extends LoginSettingsState {
  NavigateBackState(LoginSettingsState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          isCustomServer: state.isCustomServer,
          customServerUrl: state.customServerUrl,
          isCustomServerUrlValid: state.isCustomServerUrlValid,
        );
}

/// State to indicate that the screen is busy and the user needs to wait
class ScreenIsBusyState extends LoginSettingsState {
  ScreenIsBusyState(LoginSettingsState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          isCustomServer: state.isCustomServer,
          customServerUrl: state.customServerUrl,
          isCustomServerUrlValid: state.isCustomServerUrlValid,
        );
}

class ShowInvalidCustomUrlDialogState extends LoginSettingsState {
  ShowInvalidCustomUrlDialogState(LoginSettingsState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: false,
          isCustomServer: state.isCustomServer,
          customServerUrl: state.customServerUrl,
          isCustomServerUrlValid: state.isCustomServerUrlValid,
        );
}

class ConnectionErrorState extends LoginSettingsState {
  ConnectionErrorState(LoginSettingsState state, {this.errorMessage = ''})
      : super(
          isInitialized: state.isInitialized,
          isLoading: false,
          isCustomServer: state.isCustomServer,
          customServerUrl: state.customServerUrl,
          isCustomServerUrlValid: state.isCustomServerUrlValid,
        );
  final String errorMessage;

  @override
  List<Object> get props => [
        isInitialized,
        isLoading,
        isCustomServer,
        customServerUrl,
        isCustomServerUrlValid,
        errorMessage,
      ];
}
