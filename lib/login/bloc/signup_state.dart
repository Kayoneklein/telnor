import 'package:equatable/equatable.dart';

/// Various phases of sign up process
enum SignUpStatus { none, success, invalidEmail, accountExists, otherError }

class SignUpState extends Equatable {
  const SignUpState({
    required this.isLoading,
    required this.email,
    required this.isEmailValid,
    required this.password,
    required this.isPasswordVisible,
    required this.isPasswordValid,
    required this.signUpStatus,
    required this.errorMessage,
  });

  factory SignUpState.initial() => const SignUpState(
        isLoading: false,
        email: '',
        isEmailValid: true,
        password: '',
        isPasswordVisible: false,
        isPasswordValid: true,
        signUpStatus: SignUpStatus.none,
        errorMessage: '',
      );

  final bool isLoading;
  final String email;
  final bool isEmailValid;
  final String password;
  final bool isPasswordVisible;
  final bool isPasswordValid;
  final SignUpStatus signUpStatus;
  final String errorMessage;

  SignUpState copyWith({
    bool? isLoading,
    String? email,
    bool? isEmailValid,
    String? password,
    bool? isPasswordVisible,
    bool? isPasswordValid,
    SignUpStatus? signUpStatus,
    String? errorMessage,
  }) =>
      SignUpState(
        isLoading: isLoading ?? this.isLoading,
        email: email ?? this.email,
        isEmailValid: isEmailValid ?? this.isEmailValid,
        password: password ?? this.password,
        isPasswordVisible: isPasswordVisible ?? this.isPasswordVisible,
        isPasswordValid: isPasswordValid ?? this.isPasswordValid,
        signUpStatus: signUpStatus ?? this.signUpStatus,
        errorMessage: errorMessage ?? this.errorMessage,
      );

  @override
  List<Object> get props => [
        isLoading,
        email,
        isEmailValid,
        password,
        isPasswordVisible,
        isPasswordValid,
        signUpStatus,
        errorMessage,
      ];
}
