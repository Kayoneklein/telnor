import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/language.dart';

class SettingsState extends Equatable {
  const SettingsState({
    required this.isInitialized,
    required this.currentLanguage,
    required this.allLanguages,
    required this.isChangingLanguage,
  });

  factory SettingsState.initial() => SettingsState(
    isInitialized: false,
    currentLanguage: Language.undefined,
    allLanguages: BuiltList.from(<Language>[]),
    isChangingLanguage: false,
  );

  final bool isInitialized;
  final Language currentLanguage;
  final BuiltList<Language> allLanguages;
  final bool isChangingLanguage;

  SettingsState copyWith({
    final bool? isInitialized,
    final Language? currentLanguage,
    final BuiltList<Language>? allLanguages,
    final bool? isChangingLanguage,
  }) => SettingsState(
    isInitialized: isInitialized ?? this.isInitialized,
    currentLanguage: currentLanguage ?? this.currentLanguage,
    allLanguages: allLanguages ?? this.allLanguages,
    isChangingLanguage: isChangingLanguage ?? this.isChangingLanguage,
  );

  @override
  List<Object> get props => [
    isInitialized,
    currentLanguage,
    allLanguages,
    isChangingLanguage,
  ];
}

/// State to indicate the need to show confirmation dialog
class LanguageChangingErrorState extends SettingsState {
  LanguageChangingErrorState(SettingsState state)
    : super(
        isInitialized: state.isInitialized,
        currentLanguage: state.currentLanguage,
        allLanguages: state.allLanguages,
        isChangingLanguage: false,
      );
}

/// State to indicate the need to show confirmation dialog
class ShowDiscardDialogState extends SettingsState {
  ShowDiscardDialogState(SettingsState state)
    : super(
        isInitialized: state.isInitialized,
        currentLanguage: state.currentLanguage,
        allLanguages: state.allLanguages,
        isChangingLanguage: state.isChangingLanguage,
      );
}

/// State to indicate the need to go back
class NavigateBackState extends SettingsState {
  NavigateBackState(SettingsState state)
    : super(
        isInitialized: state.isInitialized,
        currentLanguage: state.currentLanguage,
        allLanguages: state.allLanguages,
        isChangingLanguage: state.isChangingLanguage,
      );
}
