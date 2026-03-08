import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;

import 'package:bloc/bloc.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/authentication/bloc/authentication_state.dart';
import 'package:telnor/constants/global_variables.dart';
import 'package:telnor/util/app_reset.dart';
import 'package:telnor/util/biometrics.dart';
import 'package:telnor/util/localization.dart';
import 'package:telnor/util/settings.dart';
import 'package:telnor/web/scripts.dart';
import 'package:telnor/web/server_adapter.dart';
import 'package:telnor/web/web.dart';

class AuthenticationBloc
    extends Bloc<AuthenticationEvent, AuthenticationState> {
  AuthenticationBloc() : super(Uninitialized()) {
    try {
      on<AuthenticationEvent>((event, emit) async {
        // App lifecycle events
        if (event is AppStartedEvent) {
          await WebProvider.get.initialization;
          await Localization.get.initialization;
          await JavaScripts.get.initialize();
          await BiometricsService.get.initialization;
          await checkAppVersionCompatibility();

          final bool isLoggedIn = await _settings.isLoggedIn();

          if (isLoggedIn) {
            emit(Authenticated(await _settings.getCurrentUser()));
            _isInForeground = false;
            add(AppResumedEvent());
          } else {
            if (await _isFirstRun()) {
              emit(StartupGuide());
            } else {
              // emit(StartupGuide());
              emit(Unauthenticated());
            }
          }
        }
        //App went in background
        if (event is AppPausedEvent) {
          _stopTimer();
          _saveLastActiveTime();
          _isInForeground = false;
        }
        //App went in foreground
        if (event is AppResumedEvent) {
          final time = await _loadLastActiveTime();
          final minutes = await _loadMinutesTillLogout();

          final biometrics = await _loadBiometricsEnabled();
          if (!_isInForeground && state is Authenticated) {
            _startTimer();
            if (minutes > 0 &&
                time != null &&
                DateTime.now().isAfter(time.add(Duration(minutes: minutes)))) {
              add(SessionExpiredEvent());
            } else if (biometrics && BiometricsService.get.canCheckBiometrics) {
              emit(BiometricLock.from(state));
            } else if (time != null &&
                minutes > 0 &&
                DateTime.now().isAfter(time.add(Duration(minutes: minutes)))) {
              add(SessionExpiredEvent());
            }
          }
          _isInForeground = true;
        }
        // User requested to log in
        if (event is LoginRequestedEvent) {
          emit(Unauthenticated());
        }
        // User requested to sign up
        if (event is SignUpRequestedEvent) {
          emit(SigningUp());
        }
        // User requested to view guide
        if (event is GuideRequestedEvent) {
          emit(StartupGuide());
        }
        // User logged into the app
        if (event is SignedInEvent) {
          if (event.minutesTillAutoLogout > 0) {
            _saveMinutesTillLogout(event.minutesTillAutoLogout);
          }

          _saveBiometricsEnabled(event.biometricsEnabled);
          final user = await _settings.getCurrentUser();
          if (!user.isPremium) {
            emit(ShowPremiumFeaturesDialog());
          }
          if (!user.isEmailVerified) {
            emit(ShowUnverifiedEmailDialog());
          }
          _startTimer();
          emit(Authenticated(user));

          if (event.minutesTillAutoLogout > 0) {
            await Future.delayed(
              Duration(minutes: event.minutesTillAutoLogout),
              () {
                emit(SessionExpired());
              },
            );
          }
        }

        // User performed biometric input
        if (event is BiometricInputEvent) {
          final currentState = state;
          final bool isLoggedIn = await _settings.isLoggedIn();
          if (event.authorized && currentState is BiometricLock && isLoggedIn) {
            emit(currentState.previousState);
          } else {
            add(SignedOutEvent());
          }
        }
        // User info was updated
        if (event is UserInfoChangedEvent) {
          if (state is Authenticated) {
            emit(Authenticated(await _settings.getCurrentUser()));
          }
        }
        // User updates arrived
        if (event is UserUpdatesArrivedEvent) {
          final currentState = state;
          if (currentState is Authenticated) {
            emit(
              currentState.copyWith(
                newShares: event.updates.newShares,
                newMails: event.updates.newMails,
              ),
            );
          }
        }
        // Current session has expired
        if (event is SessionExpiredEvent) {
          await _settings.setBoolean(Settings.readonlyMode, true);
          _stopTimer();
        }
        // User signed out
        if (event is SignedOutEvent) {
          _storePasswordData();
          _stopTimer();
          await _settings.setLoggedOut();
          await _server.clearSessionData();
          emit(Unauthenticated());
        }
      });
    } catch (e, s) {
      // print(s);
      dev.log("$s");
    }
  }

  final Settings _settings = Settings.get;
  final ServerAdapter _server = ServerAdapter.get;
  bool _isInForeground = true;

  bool get isInForeground => _isInForeground;

  /// Check whether premium features are available to user
  bool get isPremiumFeaturesAvailable {
    final currentState = state;
    if (currentState is Authenticated) {
      return currentState.user.isPremium || currentState.user.isPremiumTrial;
    }
    return false;
  }

  /// Check whether features for verified emails are available to user
  bool get isVerifiedFeaturesAvailable {
    final currentState = state;
    if (currentState is Authenticated) {
      return currentState.user.isEmailVerified;
    }
    return false;
  }

  static const methodChannel = MethodChannel('myPasswordManagerData');

  Future<void> _storePasswordData() async {
    try {
      await methodChannel.invokeMethod<void>('storePasswordData', {
        'password': jsonEncode('[]'),
      });
    } on PlatformException catch (e) {
      throw Exception(e.message);
    } catch (e) {
      if (kDebugMode) {
        print(
          '---------------------error during _storePasswordData---------------------\n$e',
        );
      }
    }
  }

  /// Checks if this is the first time application is run
  Future<bool> _isFirstRun() async {
    final bool ifr = await _settings.getBoolean(Settings.IS_NOT_FIRST_RUN);
    if (!ifr) {
      await _settings.setBoolean(Settings.IS_NOT_FIRST_RUN, true);
      await _settings.setString(Settings.LOCAL_APP_VERSION, appVersion);
      return true;
    }
    return false;
  }

  Future<void> _saveMinutesTillLogout(int? minutes) async {
    if (minutes != null) {
      await _settings.setString(
        Settings.LOGIN_SESSION_DURATION,
        minutes.toString(),
      );
    } else {
      await _settings.delete(Settings.LOGIN_SESSION_DURATION);
    }
  }

  Future<int> _loadMinutesTillLogout() async {
    final String? min = await _settings.getString(
      Settings.LOGIN_SESSION_DURATION,
    );
    if (min != null && min.isNotEmpty) {
      return int.parse(min);
    } else {
      return 0;
    }
  }

  Future<void> _saveBiometricsEnabled(bool? enabled) async {
    if (enabled != null) {
      await _settings.setBoolean(Settings.IS_BIOMETRICS_ENABLED, enabled);
    } else {
      await _settings.delete(Settings.IS_BIOMETRICS_ENABLED);
    }
  }

  Future<bool> _loadBiometricsEnabled() async {
    return await _settings.getBoolean(Settings.IS_BIOMETRICS_ENABLED);
  }

  Future<void> _saveLastActiveTime() async {
    await _settings.setString(
      Settings.LOGIN_SESSION_LAST_ACTIVE,
      DateTime.now().millisecondsSinceEpoch.toString(),
    );
  }

  Future<DateTime?> _loadLastActiveTime() async {
    final String? ms = await _settings.getString(
      Settings.LOGIN_SESSION_LAST_ACTIVE,
    );
    if (ms != null && ms.isNotEmpty) {
      return DateTime.fromMillisecondsSinceEpoch(int.parse(ms));
    } else {
      return null;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  Timer? timer;

  void _checkUserUpdates() {
    ServerAdapter.get.getUserUpdates(
      onSuccess: (updates) {
        add(UserUpdatesArrivedEvent(updates));
      },
      onError: (error) {
        if (error.isSessionExpired) {
          add(SessionExpiredEvent());
        }
      },
    );
  }

  void _startTimer() {
    void callback(Timer? t) {
      _checkUserUpdates();
    }

    callback.call(null);

    ///I CHANGED THE TIMER FROM 5 MINUTES TO 5 SECONDS TO REPLICATE A STREAMING SUBSCRIPTION
    ///THUS ANY UPDATES ON THE SERVER THAT WILL REQUIRE THE USER TO QUICKLY LOGOUT AUTOMATICALLY IS TRIGGERED ALMOST IMMEDIATELY
    timer = Timer.periodic(const Duration(seconds: 5), callback);
    // timer = Timer.periodic(const Duration(minutes: 5), callback);
  }

  void _stopTimer() {
    timer?.cancel();
  }
}
