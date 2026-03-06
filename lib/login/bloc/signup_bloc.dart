import 'dart:async';
import 'dart:convert';

import 'package:bloc/bloc.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/util/localization.dart';
import 'package:telnor/util/settings.dart';
import 'package:telnor/web/server_adapter.dart';

import 'signup.dart';

class SignUpBloc extends Bloc<SignUpEvent, SignUpState> {
  SignUpBloc() : super(SignUpState.initial()) {
    on<SignUpEvent>((event, emit) async {
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
      if (event is FormSubmitted) {
        final bool validEmail = state.email.isNotEmpty;
        final bool validPassword = state.password.isNotEmpty;
        if (validEmail && validPassword) {
          emit(state.copyWith(isLoading: true));
          _signUp(state.email, state.password);
        } else {
          emit(
            state.copyWith(
              isEmailValid: validEmail,
              isPasswordValid: validPassword,
            ),
          );
        }
      }
      if (event is SignUpResultReceived) {
        emit(
          state.copyWith(
            isLoading: false,
            signUpStatus: event.status,
            errorMessage: event.errorMessage,
          ),
        );
      }
      if (event is ErrorMessageViewed) {
        emit(state.copyWith(signUpStatus: SignUpStatus.none, errorMessage: ''));
      }
    });
  }

  final ServerAdapter _server = ServerAdapter.get;
  final Settings _settings = Settings.get;

  /*  @override
  Stream<SignUpState> mapEventToState(
    SignUpEvent event,
  ) async* {
    if (event is EmailChanged) {
      emit( state.copyWith(
        email: event.email,
        isEmailValid: (event.email != state.email) ? true : state.isEmailValid,
      );
    }
    if (event is PasswordChanged) {
      emit( state.copyWith(
        password: event.password,
        isPasswordValid: (event.password != state.password) ? true : state.isPasswordValid,
      );
    }
    if (event is PasswordVisibilityChanged) {
      emit( state.copyWith(
        isPasswordVisible: !state.isPasswordVisible,
      );
    }
    if (event is FormSubmitted) {
      final bool validEmail = state.email.isNotEmpty;
      final bool validPassword = state.password.isNotEmpty;
      if (validEmail && validPassword) {
        emit( state.copyWith(
          isLoading: true,
        );
        _signUp(state.email, state.password);
      } else {
        emit( state.copyWith(
          isEmailValid: validEmail,
          isPasswordValid: validPassword,
        );
      }
    }
    if (event is SignUpResultReceived) {
      emit( state.copyWith(
        isLoading: false,
        signUpStatus: event.status,
        errorMessage: event.errorMessage,
      );
    }
    if (event is ErrorMessageViewed) {
      emit( state.copyWith(
        signUpStatus: SignUpStatus.none,
        errorMessage: '',
      );
    }
  }*/

  //--------------------------------------------------------------------------------------------------------------------

  /// Attempt to sign into the system
  Future<void> _signUp(String email, String password) async {
    await _server.signUp(
      email: state.email,
      password: state.password,
      onSuccess: (user) async {
        await _server.saveGroups(
          groups: jsonDecode(
            l10n('default', 'PCDEFAULTGROUPJSON'),
          ).map<Group>((dynamic j) => Group.fromJson(j)).toList(),
        );
        final Map<String, dynamic> team = jsonDecode(
          l10n('default', 'PCDEFAULTTEAMJSON'),
        );
        await _server.createTeam(
          name: team['name'],
          contact: team['contact'],
          email: user.email,
        );
        await _settings.setLoggedIn();
        await _settings.setCurrentUser(user);
        await _saveLoginData();
        add(const SignUpResultReceived(status: SignUpStatus.success));
      },
      onError: (error) {
        if (error.isWrongParameter) {
          add(const SignUpResultReceived(status: SignUpStatus.invalidEmail));
        } else if (error.isInvalidPassword) {
          add(const SignUpResultReceived(status: SignUpStatus.accountExists));
        } else if (error.isAccountExists) {
          add(const SignUpResultReceived(status: SignUpStatus.accountExists));
        } else if (error.isConnectionError) {
          add(
            SignUpResultReceived(
              status: SignUpStatus.otherError,
              errorMessage: error.message,
            ),
          );
        } else {
          add(
            SignUpResultReceived(
              status: SignUpStatus.otherError,
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
  }
}
