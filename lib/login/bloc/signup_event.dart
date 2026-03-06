import 'package:equatable/equatable.dart';
import 'package:telnor/login/bloc/signup.dart';

abstract class SignUpEvent extends Equatable {
  const SignUpEvent();

  @override
  List<Object> get props => [];
}

/// User modified email field
class EmailChanged extends SignUpEvent {
  const EmailChanged({required this.email});

  final String email;

  @override
  List<Object> get props => [email];
}

/// User modified password
class PasswordChanged extends SignUpEvent {
  const PasswordChanged({required this.password});

  final String password;

  @override
  List<Object> get props => [password];
}

/// User pressed Show/Hide password button
class PasswordVisibilityChanged extends SignUpEvent {}

/// User submitted the form
class FormSubmitted extends SignUpEvent {}

///Sign up result received
class SignUpResultReceived extends SignUpEvent {
  const SignUpResultReceived({required this.status, this.errorMessage = ''});

  final SignUpStatus status;
  final String errorMessage;

  @override
  List<Object> get props => [status, errorMessage];
}

class ErrorMessageViewed extends SignUpEvent {}
