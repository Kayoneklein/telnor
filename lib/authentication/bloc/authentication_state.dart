import 'package:equatable/equatable.dart';
import 'package:telnor/model/user.dart';

class AuthenticationState extends Equatable {
  const AuthenticationState();

  /// Get the number of new passwords shared with the user
  int get newSharesCount {
    final currentState = this;
    if (currentState is Authenticated) {
      return currentState.newShares;
    }
    return 0;
  }

  /// Get the number of new messages sent to the user
  int get newMessagesCount {
    final currentState = this;
    if (currentState is Authenticated) {
      return currentState.newMails;
    }
    return 0;
  }

  @override
  List<Object> get props => [];
}

/// Application data is not yet initialized
class Uninitialized extends AuthenticationState {}

/// Show startup guide with initial hints
class StartupGuide extends AuthenticationState {}

/// Sign up screen is displayed
class SigningUp extends AuthenticationState {}

/// Signals the need to show dialog with premium features
class ShowPremiumFeaturesDialog extends AuthenticationState {}

/// Signals the need to show dialog about email not verified
class ShowUnverifiedEmailDialog extends AuthenticationState {}

/// User is authenticated and user info is available
class Authenticated extends AuthenticationState {
  const Authenticated(this.user, {this.newShares = 0, this.newMails = 0});

  final User user;
  final int newShares;
  final int newMails;

  Authenticated copyWith({User? user, int? newShares, int? newMails}) {
    return Authenticated(
      user ?? this.user,
      newShares: newShares ?? this.newShares,
      newMails: newMails ?? this.newMails,
    );
  }

  @override
  List<Object> get props => [user, newShares, newMails];
}

/// Session is expired: need to show dialog and exit to login screen
class SessionExpired extends AuthenticationState {}

/// Login screen is displayed
class Unauthenticated extends AuthenticationState {}

class BiometricLock extends AuthenticationState {
  const BiometricLock.from(this.previousState);

  final AuthenticationState previousState;

  @override
  List<Object> get props => [previousState];
}

/// Show Authentication Dialog
class ShowAuthenticationDialog extends AuthenticationState {}
