import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:telnor/util/settings.dart';

import './account_info.dart';

class AccountInfoBloc extends Bloc<AccountInfoEvent, AccountInfoState> {
  AccountInfoBloc() : super(AccountInfoState.initial()) {
    _loadAccountInfo();

    on<AccountInfoEvent>((event, emit) {
      //Info loaded
      if (event is AccountInfoLoaded) {
        emit(state.copyWith(isInitialized: true, isLoading: false));
      }
      //Name changed
      if (event is NewPasswordChanged) {
        emit(
          state.copyWith(
            newPassword: event.newPassword,
            isNewPasswordValid: (event.newPassword != state.newPassword)
                ? true
                : state.isNewPasswordValid,
          ),
        );
      }
      //Department changed
      if (event is ConfirmPasswordChanged) {
        emit(
          state.copyWith(
            confirmPassword: event.confirmPassword,
            isConfirmPasswordValid:
                (event.confirmPassword != state.confirmPassword)
                ? true
                : state.isConfirmPasswordValid,
          ),
        );
      }
      //Apply changes
      if (event is ChangesConfirmed) {
        final bool validNewPassword = state.newPassword.isNotEmpty;
        final bool validConfirmPassword =
            state.confirmPassword == state.newPassword;
        if (validNewPassword && validConfirmPassword) {
          emit(state.copyWith(isLoading: true));
          _saveAccountInfo();
        } else {
          emit(
            state.copyWith(
              isNewPasswordValid: validNewPassword,
              isConfirmPasswordValid: validConfirmPassword,
            ),
          );
        }
      }
      //Saving finished
      if (event is AccountInfoSaved) {
        emit(
          AccountInfoSavedState.from(
            state.copyWith(isLoading: false),
            isSuccess: event.isSuccess,
          ),
        );
      }
      //Discard changes
      if (event is BackButtonPressed) {
        if (needToShowConfirmationDialog()) {
          emit(ShowDiscardDialogState.from(state));
        } else {
          emit(NavigateBackState.from(state));
        }
      }
      //Answer dialog question
      if (event is DialogConfirmationReceived) {
        if (event.isYes) {
          emit(NavigateBackState.from(state));
        } else {
          emit(state.copyWith());
        }
      }
      //Session expired
      if (event is SessionExpired) {
        emit(const SessionExpiredState());
      }
      if (event is ConnectionErrorEvent) {
        emit(
          ConnectionErrorState.from(state, errorMessage: event.errorMessage),
        );
      }
    });
  }

  final Settings _settings = Settings.get;
  String _originalEmail = '';

  /*  @override
  Stream<AccountInfoState> mapEventToState(
    AccountInfoEvent event,
  ) async* {
    //Info loaded
    if (event is AccountInfoLoaded) {
      yield state.copyWith(
        isInitialized: true,
        isLoading: false,
      );
    }
    //Name changed
    if (event is NewPasswordChanged) {
      yield state.copyWith(
        newPassword: event.newPassword,
        isNewPasswordValid: (event.newPassword != state.newPassword) ? true : state.isNewPasswordValid,
      );
    }
    //Department changed
    if (event is ConfirmPasswordChanged) {
      yield state.copyWith(
        confirmPassword: event.confirmPassword,
        isConfirmPasswordValid: (event.confirmPassword != state.confirmPassword) ? true : state.isConfirmPasswordValid,
      );
    }
    //Apply changes
    if (event is ChangesConfirmed) {
      final bool validNewPassword = state.newPassword.isNotEmpty;
      final bool validConfirmPassword = state.confirmPassword == state.newPassword;
      if (validNewPassword && validConfirmPassword) {
        yield state.copyWith(
          isLoading: true,
        );
        _saveAccountInfo();
      } else {
        yield state.copyWith(
          isNewPasswordValid: validNewPassword,
          isConfirmPasswordValid: validConfirmPassword,
        );
      }
    }
    //Saving finished
    if (event is AccountInfoSaved) {
      yield AccountInfoSavedState.from(state.copyWith(isLoading: false), isSuccess: event.isSuccess);
    }
    //Discard changes
    if (event is BackButtonPressed) {
      if (needToShowConfirmationDialog()) {
        yield ShowDiscardDialogState.from(state);
      } else {
        yield NavigateBackState.from(state);
      }
    }
    //Answer dialog question
    if (event is DialogConfirmationReceived) {
      if (event.isYes) {
        yield NavigateBackState.from(state);
      } else {
        yield state.copyWith();
      }
    }
    //Session expired
    if (event is SessionExpired) {
      yield const SessionExpiredState();
    }
    if (event is ConnectionErrorEvent) {
      yield ConnectionErrorState.from(state, errorMessage: event.errorMessage);
    }
  }*/

  //--------------------------------------------------------------------------------------------------------------------

  /// Load current account info
  Future<void> _loadAccountInfo() async {
    try {
      _originalEmail = (await _settings.getCurrentUser()).email;
      add(AccountInfoLoaded(email: _originalEmail));
    } catch (error) {
      //!!!
    }
  }

  /// Save new account info
  Future<void> _saveAccountInfo() async {
    //!!!    _server.updateUserInfo(
    //      user,
    //      onSuccess: () {
    add(const AccountInfoSaved(isSuccess: true));
    //      },
    //      onError: (error) {
    //        add(error.isSessionExpired ? SessionExpired() : const UserInfoSaved(isSuccess: false));
    //      },
    //    );
  }

  /// Defines whether confirmation dialog about discarding changes is needed
  bool needToShowConfirmationDialog() {
    return false;
  }
}
