import 'package:equatable/equatable.dart';

class AccountInfoState extends Equatable {
  const AccountInfoState({
    required this.isInitialized,
    required this.isLoading,
    required this.newPassword,
    required this.isNewPasswordValid,
    required this.confirmPassword,
    required this.isConfirmPasswordValid,
  });

  factory AccountInfoState.initial() => const AccountInfoState(
        isInitialized: false,
        isLoading: true,
        newPassword: '',
        isNewPasswordValid: true,
        confirmPassword: '',
        isConfirmPasswordValid: true,
      );

  final bool isInitialized;
  final bool isLoading;
  final String newPassword;
  final bool isNewPasswordValid;
  final String confirmPassword;
  final bool isConfirmPasswordValid;

  AccountInfoState copyWith({
    bool? isInitialized,
    bool? isLoading,
    String? newPassword,
    bool? isNewPasswordValid,
    String? confirmPassword,
    bool? isConfirmPasswordValid,
  }) =>
      AccountInfoState(
        isInitialized: isInitialized ?? this.isInitialized,
        isLoading: isLoading ?? this.isLoading,
        newPassword: newPassword ?? this.newPassword,
        isNewPasswordValid: isNewPasswordValid ?? this.isNewPasswordValid,
        confirmPassword: confirmPassword ?? this.confirmPassword,
        isConfirmPasswordValid: isConfirmPasswordValid ?? this.isConfirmPasswordValid,
      );

  @override
  List<Object> get props => [
        isInitialized,
        isLoading,
        newPassword,
        isNewPasswordValid,
        confirmPassword,
        isConfirmPasswordValid,
      ];
}

/// State to indicate the need to show confirmation dialog
class ShowDiscardDialogState extends AccountInfoState {
  ShowDiscardDialogState.from(AccountInfoState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          newPassword: state.newPassword,
          isNewPasswordValid: state.isNewPasswordValid,
          confirmPassword: state.confirmPassword,
          isConfirmPasswordValid: state.isConfirmPasswordValid,
        );
}

/// State to indicate the finish of data saving process
class AccountInfoSavedState extends AccountInfoState {
  AccountInfoSavedState.from(
    AccountInfoState state, {
    required this.isSuccess,
  }) : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          newPassword: state.newPassword,
          isNewPasswordValid: state.isNewPasswordValid,
          confirmPassword: state.confirmPassword,
          isConfirmPasswordValid: state.isConfirmPasswordValid,
        );

  final bool isSuccess;

  @override
  List<Object> get props => [
        isInitialized,
        isLoading,
        newPassword,
        isNewPasswordValid,
        confirmPassword,
        isConfirmPasswordValid,
        isSuccess,
      ];
}

/// State to indicate the need to go back
class NavigateBackState extends AccountInfoState {
  NavigateBackState.from(AccountInfoState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          newPassword: state.newPassword,
          isNewPasswordValid: state.isNewPasswordValid,
          confirmPassword: state.confirmPassword,
          isConfirmPasswordValid: state.isConfirmPasswordValid,
        );
}

/// State to indicate the expired session
class SessionExpiredState extends AccountInfoState {
  const SessionExpiredState()
      : super(
          isInitialized: false,
          isLoading: false,
          newPassword: '',
          isNewPasswordValid: true,
          confirmPassword: '',
          isConfirmPasswordValid: true,
        );
}

class ConnectionErrorState extends AccountInfoState {
  ConnectionErrorState.from(AccountInfoState state, {required this.errorMessage})
      : super(
          isInitialized: state.isInitialized,
          isLoading: false,
          newPassword: state.newPassword,
          isNewPasswordValid: state.isNewPasswordValid,
          confirmPassword: state.confirmPassword,
          isConfirmPasswordValid: state.isConfirmPasswordValid,
        );

  final String errorMessage;

  @override
  List<Object> get props => [
    errorMessage,
    isInitialized,
    isLoading,
    newPassword,
    isNewPasswordValid,
    confirmPassword,
    isConfirmPasswordValid,
  ];
}