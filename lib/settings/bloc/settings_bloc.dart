import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:built_collection/built_collection.dart';
import 'package:telnor/util/localization.dart';

import 'settings.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc() : super(SettingsState.initial()) {
    //loadInitialState();

    on<SettingsEvent>((event, emit) async {
      if (event is SettingsInitialized) {
        _initialState = SettingsState(
          isInitialized: true,
          currentLanguage: event.currentLanguage,
          allLanguages: BuiltList.from(event.allLanguages),
          isChangingLanguage: false,
        );
        emit(_initialState!);
      }
      //Change current language
      if (event is LanguageSelectionChanged) {
        if (event.position > -1 &&
            event.position < state.allLanguages.length &&
            state.currentLanguage != state.allLanguages[event.position]) {
          emit(state.copyWith(isChangingLanguage: true));
          final result = await Localization.get.changeLanguage(
            state.allLanguages[event.position],
          );
          if (result) {
            isLanguageChanged = true;
            emit(
              state.copyWith(
                isChangingLanguage: false,
                currentLanguage: Localization.get.currentLanguage,
              ),
            );
          } else {
            emit(LanguageChangingErrorState(state));
          }
        }
      }
      //Apply changes
      if (event is ChangesConfirmed) {
        //TODO apply changes
        emit(NavigateBackState(state));
      }
      //Discard changes
      if (event is BackButtonPressed) {
        if (needToShowConfirmationDialog()) {
          emit(ShowDiscardDialogState(state));
        } else {
          emit(NavigateBackState(state));
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
    });
  }

  SettingsState? _initialState;
  bool isLanguageChanged = false;

  /*  @override
  Stream<SettingsState> mapEventToState(
    SettingsEvent event,
  ) async* {
    if (event is SettingsInitialized) {
      _initialState = SettingsState(
        isInitialized: true,
        currentLanguage: event.currentLanguage,
        allLanguages: BuiltList.from(event.allLanguages),
        isChangingLanguage: false,
      );
      yield _initialState!;
    }
    //Change current language
    if (event is LanguageSelectionChanged) {
      if (event.position > -1 &&
          event.position < state.allLanguages.length &&
          state.currentLanguage != state.allLanguages[event.position]) {
        yield state.copyWith(
          isChangingLanguage: true,
        );
        final result = await Localization.get.changeLanguage(state.allLanguages[event.position]);
        if (result) {
          isLanguageChanged= true;
          yield state.copyWith(
            isChangingLanguage: false,
            currentLanguage: Localization.get.currentLanguage,
          );
        } else {
          yield LanguageChangingErrorState(state);
        }
      }
    }
    //Apply changes
    if (event is ChangesConfirmed) {
      //TODO apply changes
      yield NavigateBackState(state);
    }
    //Discard changes
    if (event is BackButtonPressed) {
      if (needToShowConfirmationDialog()) {
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
  }*/

  ///Load data for initial state
  Future<void> loadInitialState() async {
    add(
      SettingsInitialized(
        currentLanguage: Localization.get.currentLanguage,
        allLanguages: Localization.get.allLanguages,
      ),
    );
  }

  /// Defines whether confirmation dialog about discarding changes is needed
  bool needToShowConfirmationDialog() {
    return false; //!!! only show Dialog if data is initialized
  }
}
