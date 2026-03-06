import 'package:equatable/equatable.dart';
import 'package:telnor/model/language.dart';

abstract class SettingsEvent extends Equatable {
  const SettingsEvent();

  @override
  List<Object> get props => [];
}

/// Loading initial state finished
class SettingsInitialized extends SettingsEvent {
  const SettingsInitialized({
    required this.currentLanguage,
    required this.allLanguages,
  });

  final Language currentLanguage;
  final List<Language> allLanguages;

  @override
  List<Object> get props => [currentLanguage, allLanguages];
}

/// User changed current language
class LanguageSelectionChanged extends SettingsEvent {
  const LanguageSelectionChanged({required this.position});

  final int position;

  @override
  List<Object> get props => [position];
}

/// User confirmed the changes
class ChangesConfirmed extends SettingsEvent {}

/// User tries to discard the changes
class BackButtonPressed extends SettingsEvent {}

/// User closed discard confirmation dialog
class DialogConfirmationReceived extends SettingsEvent {
  const DialogConfirmationReceived({required this.isYes});

  final bool isYes;

  @override
  List<Object> get props => [isYes];
}
