import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/model/configuration.dart';
import 'package:telnor/util/biometrics.dart';
import 'package:telnor/util/settings.dart';
import 'package:telnor/web/server_adapter.dart';
import 'package:telnor/web/web.dart';

import 'login.dart';

/// Bloc that handles interactions on login screen
class LoginBloc extends Bloc<LoginEvent, LoginState> {
  LoginBloc() : super(LoginState.initial()) {
    on<LoginEvent>((event, emit) async {
      if (event is EmailChanged) {
        emit(
          state.copyWith(
            email: event.email,
            isEmailValid: (event.email != state.email)
                ? true
                : state.isEmailValid,
          ),
        );
      }
      if (event is PasswordChanged) {
        emit(
          state.copyWith(
            password: event.password,
            isPasswordValid: (event.password != state.password)
                ? true
                : state.isPasswordValid,
          ),
        );
      }
      if (event is PasswordVisibilityChanged) {
        emit(state.copyWith(isPasswordVisible: !state.isPasswordVisible));
      }
      if (event is AutoLogoutValueChanged) {
        emit(state.copyWith(autoLogout: event.value));
      }
      if (event is BiometricsAvailableChanged) {
        emit(
          state.copyWith(
            biometricsAvailable: event.enabled,
            isDeviceSupported: event.isDeviceSupported,
          ),
        );
      }
      if (event is BiometricsCheckedChanged) {
        emit(state.copyWith(biometricsChecked: event.checked));

        final sharedPreferences = await SharedPreferences.getInstance();

        sharedPreferences.setBool(
          Settings.LOGIN_BIOMETRICS_CHECKBOX,
          event.checked,
        );
      }
      if (event is FormSubmitted) {
        final bool validEmail = state.email.isNotEmpty;
        final bool validPassword = state.password.isNotEmpty;
        if (validEmail && validPassword) {
          emit(state.copyWith(isLoading: true));
          _login(state.email, state.password, event.pin);
        } else {
          emit(
            state.copyWith(
              isEmailValid: validEmail,
              isPasswordValid: validPassword,
            ),
          );
        }
      }
      if (event is FormSubmittedBioMatrix) {
        final bool validEmail = event.email?.isNotEmpty == true;
        final bool validPassword = event.password?.isNotEmpty == true;
        if (validEmail && validPassword) {
          emit(
            state.copyWith(
              isLoading: true,
              password: event.password,
              email: event.email,
            ),
          );
          _login(event.email ?? '', event.password ?? '', event.pin);
        } else {
          emit(
            state.copyWith(
              isEmailValid: validEmail,
              isPasswordValid: validPassword,
            ),
          );
        }
      }
      if (event is Login2faRequested) {
        emit(state.copyWith(isType2fa: true));
      }
      if (event is LoginResultReceived) {
        emit(
          state.copyWith(
            isLoading: false,
            loginStatus: event.status,
            errorMessage: event.errorMessage,
          ),
        );
      }
      if (event is ErrorMessageViewed) {
        emit(state.copyWith(loginStatus: LoginStatus.none, errorMessage: ''));
      }
      if (event is VeryFirstTimeLogin) {
        emit(state.copyWith(veryFirstTimeLogin: true));
      }
      if (event is AutomaticallyChangeCustomUrl) {
        emit(state.copyWith(isCustomServer: event.isCustomServer));
      }
    });

    _loadLoginData();
  }

  final ServerAdapter _server = ServerAdapter.get;
  final Settings _settings = Settings.get;

  final navigatorKey = GlobalKey<NavigatorState>();

  Future<void> _login(String email, String password, String? pin) async {
    _server.login(
      email: email.trim(),
      password: password,
      pin: pin,
      onSuccess: (user) async {
        await _settings.setLoggedIn();
        await _settings.setCurrentUser(user);
        await _saveLoginData();
        add(const LoginResultReceived(status: LoginStatus.success));
        // get global emergency status
        _getGlobalEmergencyStatus(password);
      },
      onPinCodeRequired: () {
        add(const LoginResultReceived(status: LoginStatus.pinCodeRequired));
      },
      onType2faRequired: () {
        add(Login2faRequested());
      },
      onError: (error) {
        if (error.isUnknownUser) {
          add(const LoginResultReceived(status: LoginStatus.unknownUser));
        } else if (error.isInvalidPassword) {
          add(const LoginResultReceived(status: LoginStatus.invalidPassword));
        } else if (error.isEmailNotVerified) {
          add(const LoginResultReceived(status: LoginStatus.emailNotVerified));
        } else if (error.isConnectionError) {
          add(
            LoginResultReceived(
              status: LoginStatus.otherError,
              errorMessage: error.message,
            ),
          );
        } else {
          add(
            LoginResultReceived(
              status: LoginStatus.otherError,
              errorMessage: error.message,
            ),
          );
        }
      },
    );
  }

  /// Save latest login settings
  Future<void> _saveLoginData() async {
    await _settings.setString(Settings.LOGIN_LATEST_EMAIL, state.email);
    await _settings.setBoolean(Settings.readonlyMode, false);
    // await _settings.setString(Settings.LOGIN_LATEST_PASSWORD, state.password);
    await _settings.setString(
      Settings.LOGIN_AUTO_LOGOUT,
      state.autoLogout.index.toString(),
    );
    await _settings.setBoolean(
      Settings.LOGIN_BIOMETRICS_CHECKBOX,
      state.biometricsChecked,
    );
  }

  /// Load latest login settings
  Future<void> _loadLoginData() async {
    final pref = Preferences();

    final configResults = await WebProvider.get.getRemoteConfig();
    final RemoteConfiguration remoteConfiguration =
        configResults.data ?? RemoteConfiguration.initial;

    if (await pref.isFromAutofill != true) {
      if (remoteConfiguration.disableConfigServer == false) {
        if (await pref.firstTimeLoginServer != true) {
          add(VeryFirstTimeLogin());
        }
      }
    }

    final latestLogin = await pref.latestEmail ?? '';

    if (latestLogin != state.email) {
      add(EmailChanged(email: latestLogin));
    }

    final autoLogout =
        AutoLogoutTimer.values[int.parse(await pref.autoLogout ?? '0')];
    if (autoLogout != state.autoLogout) {
      add(AutoLogoutValueChanged(value: autoLogout));
    }
    final biometricsAvailable = BiometricsService.get.canCheckBiometrics;
    final isDeviceSupported = BiometricsService.get.isDeviceSupported;
    final biometricsChecked = await pref.biometricCheckbox;
    if (biometricsChecked != null && biometricsChecked == true) {
      // final authorized = await BiometricsService.get.authorize();
      // await Future<void>.delayed(const Duration(milliseconds: 100));
      // await _settings.setString(Settings.LOGIN_LATEST_EMAIL, latestLogin);
      // final latestLoginPassword = pref.latestPass ?? '';
      // if (authorized) {
      //   _onSubmitPressed(latestLogin, latestLoginPassword);
      // } else {
      //   await _settings.setString(Settings.LOGIN_LATEST_EMAIL, latestLogin);
      //   await _settings.setString(
      //       Settings.LOGIN_LATEST_PASSWORD, latestLoginPassword);
      // }
      add(
        BiometricsAvailableChanged(
          enabled: biometricsAvailable,
          isDeviceSupported: isDeviceSupported,
        ),
      );
      add(
        BiometricsCheckedChanged(
          checked: biometricsAvailable && biometricsChecked == true,
        ),
      );
    } else {
      add(
        BiometricsAvailableChanged(
          enabled: biometricsAvailable,
          isDeviceSupported: isDeviceSupported,
        ),
      );
      add(BiometricsCheckedChanged(checked: biometricsAvailable));
    }
  }

  void _getGlobalEmergencyStatus(String password) {
    _server.getGlobalEmergencyStatus(
      onError: (error) {
        if (kDebugMode) {
          print(error);
        }
      },
      onSuccess: (status) {
        if (kDebugMode) {
          print('getGlobalEmergencyStatus onSuccess: $status');
        }
        if (status) {
          // do nothing
          return;
        }
        // make other api calls
        _server.getGlobalEmergencySetup(
          password,
          onSuccess: () {
            if (kDebugMode) {
              print('getGlobalEmergencySetup onSuccess');
            }
          },
          onError: (error) {
            if (kDebugMode) {
              print(error);
            }
          },
        );
      },
    );
  }
}
