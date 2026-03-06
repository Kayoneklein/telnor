import 'package:equatable/equatable.dart';
import 'package:telnor/model/user.dart';

abstract class AuthenticationEvent extends Equatable {
  const AuthenticationEvent();

  @override
  List<Object> get props => [];
}

/// Happens once as soon as app is launched
class AppStartedEvent extends AuthenticationEvent {}

/// Happens each time app goes to background
class AppPausedEvent extends AuthenticationEvent {}

/// Happens each time app returns from background
class AppResumedEvent extends AuthenticationEvent {}

/// Indicates the need to display login screen
class LoginRequestedEvent extends AuthenticationEvent {}

/// Indicates the need to display sign up screen
class SignUpRequestedEvent extends AuthenticationEvent {}

/// Indicates the need to display startup guide screen
class GuideRequestedEvent extends AuthenticationEvent {}

/// User logged into the app
class SignedInEvent extends AuthenticationEvent {
  const SignedInEvent({
    this.minutesTillAutoLogout = 0,
    this.biometricsEnabled = false,
  });

  final int minutesTillAutoLogout;
  final bool biometricsEnabled;

  @override
  List<Object> get props => [minutesTillAutoLogout, biometricsEnabled];
}

class BiometricInputEvent extends AuthenticationEvent {
  const BiometricInputEvent({required this.authorized});

  final bool authorized;

  @override
  List<Object> get props => [authorized];
}

/// Session timed out or expired on backend
class SessionExpiredEvent extends AuthenticationEvent {}

/// Some information about current user was changed
class UserInfoChangedEvent extends AuthenticationEvent {}

/// User received new shares or mails
class UserUpdatesArrivedEvent extends AuthenticationEvent {
  const UserUpdatesArrivedEvent(this.updates);

  final UserUpdates updates;

  @override
  List<Object> get props => [updates];
}

/// User explicitly terminated the session
class SignedOutEvent extends AuthenticationEvent {}

/// Show Authentication dialog
class ShowAuthenticationDialogEvent extends AuthenticationEvent {}

/// Ask bio
class BiometricAuthEvent extends AuthenticationEvent {}
