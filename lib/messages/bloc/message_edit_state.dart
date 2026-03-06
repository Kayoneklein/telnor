import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/team.dart';

class MessageEditState extends Equatable {
  const MessageEditState({
    required this.subject,
    required this.isSubjectValid,
    required this.message,
    required this.members,
  });

  factory MessageEditState.initial({
    String? subject,
    String? message,
    List<TeamMember>? members,
  }) {
    return MessageEditState(
      subject: subject ?? '',
      isSubjectValid: true,
      message: message ?? '',
      members: BuiltList.from(members ?? <TeamMember>[]),
    );
  }

  final String subject;
  final bool isSubjectValid;
  final String message;
  final BuiltList<TeamMember> members;

  MessageEditState copyWith({
    String? subject,
    bool? isSubjectValid,
    String? message,
    BuiltList<TeamMember>? members,
  }) {
    return MessageEditState(
      subject: subject ?? this.subject,
      isSubjectValid: isSubjectValid ?? this.isSubjectValid,
      message: message ?? this.message,
      members: members ?? this.members,
    );
  }

  @override
  List<Object> get props => [subject, isSubjectValid, message, members];
}

/// Screen needs to show confirmation dialog about changes discarding
class ConfirmDiscardChangesState extends MessageEditState {
  ConfirmDiscardChangesState.from(MessageEditState state)
    : super(
        subject: state.subject,
        isSubjectValid: state.isSubjectValid,
        message: state.message,
        members: state.members,
      );
}

/// Screen needs to close and return to previous screen
///
/// Optional [result] argument defines result that should be returned to previous screen
class FinishEditState extends MessageEditState {
  FinishEditState.from(MessageEditState state, {this.result})
    : super(
        subject: state.subject,
        isSubjectValid: state.isSubjectValid,
        message: state.message,
        members: state.members,
      );

  final MessageInfo? result;

  @override
  List<Object> get props => [subject, isSubjectValid, message, members];
}
