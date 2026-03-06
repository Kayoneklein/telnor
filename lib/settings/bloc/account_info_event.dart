import 'package:equatable/equatable.dart';

abstract class AccountInfoEvent extends Equatable {
  const AccountInfoEvent();

  @override
  List<Object> get props => [];
}

/// Current account info loaded from the server
class AccountInfoLoaded extends AccountInfoEvent {
  const AccountInfoLoaded({required this.email});

  final String email;

  @override
  List<Object> get props => [email];
}

/// User modified new possword
class NewPasswordChanged extends AccountInfoEvent {
  const NewPasswordChanged({required this.newPassword});

  final String newPassword;

  @override
  List<Object> get props => [newPassword];
}

/// User modified password confirmation
class ConfirmPasswordChanged extends AccountInfoEvent {
  const ConfirmPasswordChanged({required this.confirmPassword});

  final String confirmPassword;

  @override
  List<Object> get props => [confirmPassword];
}

/// User pressed BACK button
class BackButtonPressed extends AccountInfoEvent {}

/// User confirmed (or canceled) the dialog
class DialogConfirmationReceived extends AccountInfoEvent {
  const DialogConfirmationReceived({required this.isYes});

  final bool isYes;

  @override
  List<Object> get props => [isYes];
}

/// User confirmed the changes made
class ChangesConfirmed extends AccountInfoEvent {}

/// New user info saved to the server
class AccountInfoSaved extends AccountInfoEvent {
  const AccountInfoSaved({required this.isSuccess});

  final bool isSuccess;

  @override
  List<Object> get props => [isSuccess];
}

/// Session expired
class SessionExpired extends AccountInfoEvent{}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends AccountInfoEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}
