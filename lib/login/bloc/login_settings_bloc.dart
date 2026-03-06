import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/util/localization.dart';
import 'package:telnor/util/settings.dart';
import 'package:telnor/web/scripts.dart';
import 'package:telnor/web/server_adapter.dart';
import 'package:telnor/web/web.dart';

import 'login_settings.dart';

class LoginSettingsBloc extends Bloc<LoginSettingsEvent, LoginSettingsState> {
  LoginSettingsBloc() : super(LoginSettingsState.initial()) {
    on<LoginSettingsEvent>((event, emit) async {
      //Initial data loaded
      if (event is LoginSettingsInitialized) {
        _initialState = LoginSettingsState(
          isInitialized: true,
          isLoading: false,
          isCustomServer: event.isCustomServer,
          customServerUrl: event.customServerUrl,
          isCustomServerUrlValid: true,
        );
        emit(_initialState!);
      }
      //Change server
      if (event is ServerSelectionChanged) {
        emit(state.copyWith(isCustomServer: event.isCustomServer));
        final sharedPreferences = await SharedPreferences.getInstance();
        sharedPreferences.setBool(
          Settings.LOGIN_IS_CUSTOM_SERVER,
          event.isCustomServer,
        );
      }
      //Change server URL
      if (event is CustomServerUrlChanged) {
        emit(state.copyWith(customServerUrl: event.url));
      }
      //Apply changes
      if (event is ChangesConfirmed) {
        if (state.isCustomServer && !_validateUrl(state.customServerUrl)) {
          emit(state.copyWith(isCustomServerUrlValid: false));
        } else {
          String newServer;
          if (state.isCustomServer) {
            if (state.customServerUrl.toLowerCase().startsWith('http://') ||
                state.customServerUrl.toLowerCase().startsWith('https://')) {
              newServer = state.customServerUrl;
            } else {
              newServer = 'https://${state.customServerUrl}';
              emit(state.copyWith(customServerUrl: newServer));
            }
          } else {
            newServer = WebProvider.DEFAULT_SERVER;
          }
          emit(state.copyWith(isLoading: true));

          // final String previousServer = _web.currentServer;
          // await _web.changeServer(newServer);

          /// Server validity check. If server can return the remote config - it is valid.
          await _adapter.cleanRemoteConfig();
          await _adapter.getRemoteConfig(
            onSuccess: (config) {
              add(ServerValidated(serverUrl: newServer));
            },
            onError: (error) {
              add(InvalidServer());
            },
          );
        }
      }
      //Discard changes
      if (event is BackButtonPressed) {
        if (state.isLoading != true) {
          // if (_initialState != null && _initialState != state) {
          //   emit(ShowDiscardDialogState(state));
          // } else {
          emit(NavigateBackState(state));
          // }
        } else {
          emit(ScreenIsBusyState(state));
        }
      }
      //Answer dialog question
      if (event is DialogConfirmationReceived) {
        if (event.isYes) {
          emit(NavigateBackState(state));
        } else {
          emit(state.copyWith());
        }
      }
      if (event is InvalidServer) {
        emit(ShowInvalidCustomUrlDialogState(state.copyWith(isLoading: false)));
      }
      if (event is ServerValidated) {
        _web.changeServer(event.serverUrl);

        await saveData(state);
        await JavaScripts.get.initialize();
        await Localization.get.changeLanguage(Localization.get.currentLanguage);
        emit(NavigateBackState(state.copyWith(isLoading: false)));
      }
      if (event is ToggleLoginSettingIsLoading) {
        emit(state.copyWith(isLoading: event.isLoading));
      }
    });

    _loadInitialState();
  }

  final ServerAdapter _adapter = ServerAdapter.get;
  final WebProvider _web = WebProvider.get;
  final Settings _settings = Settings.get;
  LoginSettingsState? _initialState;
  final _urlValidator1 = RegExp(r'^(https://)?.+$', caseSensitive: false);
  final _urlValidator2 = RegExp(r'^(?!http://).*$', caseSensitive: false);

  /* @override
  Stream<LoginSettingsState> mapEventToState(
    LoginSettingsEvent event,
  ) async* {
    //Initial data loaded
    if (event is LoginSettingsInitialized) {
      _initialState = LoginSettingsState(
        isInitialized: true,
        isLoading: false,
        isCustomServer: event.isCustomServer,
        customServerUrl: event.customServerUrl,
        isCustomServerUrlValid: true,
      );
      yield _initialState!;
    }
    //Change server
    if (event is ServerSelectionChanged) {
      yield state.copyWith(
        isCustomServer: event.isCustomServer,
      );
    }
    //Change server URL
    if (event is CustomServerUrlChanged) {
      yield state.copyWith(
        customServerUrl: event.url,
      );
    }
    //Apply changes
    if (event is ChangesConfirmed) {
      if (state.isCustomServer && !_validateUrl(state.customServerUrl)) {
        yield state.copyWith(
          isCustomServerUrlValid: false,
        );
      } else {
        String newServer;
        if (state.isCustomServer) {
          if (state.customServerUrl.toLowerCase().startsWith('http://') ||
              state.customServerUrl.toLowerCase().startsWith('https://')) {
            newServer = state.customServerUrl;
          } else {
            newServer = 'https://${state.customServerUrl}';
          }
        } else {
          newServer = WebProvider.DEFAULT_SERVER;
        }
        yield state.copyWith(
          isLoading: true,
        );

        final String previousServer = _web.currentServer;
        await _web.changeServer(newServer);

        /// Server validity check. If server can return the remote config - it is valid.
        await _adapter.cleanRemoteConfig();
        await _adapter.getRemoteConfig(
          onSuccess: (config) {
            add(ServerValidated(serverUrl: newServer));
          },
          onError: (error) {
            _web.changeServer(previousServer);
            if (error.isConnectionError) {
              add(ConnectionError(errorMessage: error.message));
            } else {
              add(InvalidServer());
            }
          },
        );
      }
    }
    //Discard changes
    if (event is BackButtonPressed) {
      if (_initialState != null && _initialState != state) {
        yield ShowDiscardDialogState(state);
      } else {
        yield NavigateBackState(state);
      }
    }
    //Answer dialog question
    if (event is DialogConfirmationReceived) {
      if (event.isYes) {
        yield NavigateBackState(state);
      } else {
        yield state.copyWith();
      }
    }
    if (event is InvalidServer) {
      yield ShowInvalidCustomUrlDialogState(state);
    }
    if (event is ConnectionError) {
      yield ConnectionErrorState(state, errorMessage: event.errorMessage);
    }
    if (event is ServerValidated) {

      await saveData(state.copyWith(customServerUrl: event.serverUrl));
      await JavaScripts.get.initialize();
      await Localization.get.changeLanguage(Localization.get.currentLanguage);
      yield NavigateBackState(state);
    }
  }*/

  /// Check whether specified URL is valid
  bool _validateUrl(String url) {
    return _urlValidator1.hasMatch(url) && _urlValidator2.hasMatch(url);
  }

  ///Load data for initial state
  Future<void> _loadInitialState() async {
    final pref = Preferences();
    final bool isCustomServer = await pref.isCustomServer;
    final String customServerUrl = await pref.customServerUrl ?? '';
    //final bool isCustomServer= await _settings.getBoolean(Settings.LOGIN_IS_CUSTOM_SERVER);
    // final String customServerUrl = await _settings.getString(Settings
    //         .LOGIN_CUSTOM_SERVER_URL) ?? /*'https://beast.dk/passdev_ibay'*/
    //     '';

    // if (state.customServerUrl != customServerUrl) {
    add(
      LoginSettingsInitialized(
        isCustomServer: isCustomServer,
        customServerUrl: customServerUrl,
      ),
    );
    // }
  }

  ///Save settings to persistent storage
  Future<void> saveData(LoginSettingsState state) async {
    await _settings.setBoolean(
      Settings.LOGIN_IS_CUSTOM_SERVER,
      state.isCustomServer,
    );
    await _settings.setString(
      Settings.LOGIN_CUSTOM_SERVER_URL,
      state.customServerUrl,
    );
  }
}
