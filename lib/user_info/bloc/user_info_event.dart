part of '../index.dart';

abstract class UserInfoEvent extends Equatable {
  const UserInfoEvent();

  @override
  List<Object> get props => [];
}

/// Current user info loaded from the server
class UserInfoLoaded extends UserInfoEvent {
  const UserInfoLoaded({required this.user});

  final User user;

  @override
  List<Object> get props => [user];
}

/// User modified name
class NameChanged extends UserInfoEvent {
  const NameChanged({required this.name});

  final String name;

  @override
  List<Object> get props => [name];
}

/// User modified department
class DepartmentChanged extends UserInfoEvent {
  const DepartmentChanged({required this.department});

  final String department;

  @override
  List<Object> get props => [department];
}

/// User pressed 'Delete Avatar' button
class AvatarChanged extends UserInfoEvent {
  const AvatarChanged({required this.file});

  final File file;

  @override
  List<Object> get props => [file];
}

/// Avatar image finished processing (resizing)
class AvatarProcessed extends UserInfoEvent {
  const AvatarProcessed({required this.data});

  final Uint8List data;

  @override
  List<Object> get props => [data];
}

/// User pressed 'Delete Avatar' button
class DeleteAvatarPressed extends UserInfoEvent {}

/// User pressed BACK button
class BackButtonPressed extends UserInfoEvent {}

/// User confirmed (or canceled) the dialog
class DialogConfirmationReceived extends UserInfoEvent {
  const DialogConfirmationReceived({required this.isYes});

  final bool isYes;

  @override
  List<Object> get props => [isYes];
}

/// User confirmed the changes made
class ChangesConfirmed extends UserInfoEvent {}

/// New user info saved to the server
class UserInfoSaved extends UserInfoEvent {
  const UserInfoSaved({required this.isSuccess});

  final bool isSuccess;

  @override
  List<Object> get props => [isSuccess];
}

/// Session expired
class SessionExpired extends UserInfoEvent {}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends UserInfoEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}
