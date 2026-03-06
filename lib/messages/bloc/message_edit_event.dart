import 'package:equatable/equatable.dart';

abstract class MessageEditEvent extends Equatable {
  const MessageEditEvent();

  @override
  List<Object> get props => [];
}

/// User modified message subject
class SubjectChanged extends MessageEditEvent {
  const SubjectChanged({required this.subject});

  final String subject;

  @override
  List<Object> get props => [subject];
}

/// User modified message text
class MessageChanged extends MessageEditEvent {
  const MessageChanged({required this.message});

  final String message;

  @override
  List<Object> get props => [message];
}

/// User submitted the form
class FormSubmitted extends MessageEditEvent {}

/// User canceled the form
class FormCanceled extends MessageEditEvent {}

/// User confirms or closes the dialog
class ConfirmationSubmitted extends MessageEditEvent {
  const ConfirmationSubmitted({required this.isConfirmed});

  final bool isConfirmed;

  @override
  List<Object> get props => [isConfirmed];
}