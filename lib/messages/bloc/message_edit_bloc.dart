import 'package:bloc/bloc.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/team.dart';

import './message_edit.dart';

class MessageEditBloc extends Bloc<MessageEditEvent, MessageEditState> {
  MessageEditBloc({String? subject, String? message, List<TeamMember>? members})
    : super(
        MessageEditState.initial(
          subject: subject ?? '',
          message: message ?? '',
          members: members ?? [],
        ),
      ) {
    on<MessageEditEvent>((event, emit) async {
      //Field modification events
      if (event is SubjectChanged) {
        emit(
          state.copyWith(
            subject: event.subject,
            isSubjectValid: (event.subject != state.subject)
                ? true
                : state.isSubjectValid,
          ),
        );
      }
      if (event is MessageChanged) {
        emit(state.copyWith(message: event.message));
      }
      //Form submission events
      if (event is FormSubmitted) {
        final bool validSubject = state.subject.isNotEmpty;
        if (validSubject) {
          emit(FinishEditState.from(state, result: _generateMessage()));
        } else {
          emit(state.copyWith(isSubjectValid: validSubject));
        }
      }
      if (event is FormCanceled) {
        emit(ConfirmDiscardChangesState.from(state));
      }
      if (event is ConfirmationSubmitted) {
        if (event.isConfirmed) {
          emit(FinishEditState.from(state));
        } else {
          state.copyWith();
        }
      }
    });
  }

  /// Generate message for sending
  MessageInfo _generateMessage() {
    final messageInfo = MessageInfo(
      subject: state.subject,
      message: state.message,
    );

    messageInfo.teamIds = [];
    for (TeamMember teamMember in state.members) {
      if (teamMember.userId == 0) {
        messageInfo.teamIds.add(teamMember.teamId);
      } else {
        messageInfo.userIds.add(teamMember.userId);
      }
    }
    return messageInfo;
  }
}
