import 'package:equatable/equatable.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/sorting_order.dart';

abstract class MessagesEvent extends Equatable {
  const MessagesEvent();

  @override
  List<Object> get props => [];
}

/// User retried to load messages
class RetryPressed extends MessagesEvent {}

/// Usage switched to different box
class CurrentBoxChanged extends MessagesEvent {
  const CurrentBoxChanged({required this.box});

  final MessagesBox box;

  @override
  List<Object> get props => [box];
}

/// Messages finished loading
class MessagesLoaded extends MessagesEvent {
  const MessagesLoaded({required this.isSuccess, this.inbox, this.outbox});

  final bool isSuccess;
  final List<Message>? inbox;
  final List<Message>? outbox;

  @override
  List<Object> get props => [
    isSuccess,
    inbox ?? const <Message>[],
    outbox ?? const <Message>[],
  ];
}

/// User selected order to use for sorting
class SortingOrderChanged extends MessagesEvent {
  const SortingOrderChanged({required this.order});

  final MessageSortingOrder order;

  @override
  List<Object> get props => [order];
}

/// User opened or closed search view
class SearchVisibilityChanged extends MessagesEvent {
  const SearchVisibilityChanged({required this.visible});

  final bool visible;

  @override
  List<Object> get props => [visible];
}

/// User changed input in search view
class SearchTextChanged extends MessagesEvent {
  const SearchTextChanged({required this.text});

  final String text;

  @override
  List<Object> get props => [text];
}

/// User pressed some message
class MessagePressed extends MessagesEvent {
  const MessagePressed({required this.message});

  final Message message;

  @override
  List<Object> get props => [message];
}

/// User long pressed some message
class MessageLongPressed extends MessagesEvent {
  const MessageLongPressed({required this.message});

  final Message message;

  @override
  List<Object> get props => [message];
}

/// All messages selected
class SelectAllPressed extends MessagesEvent {}

/// All messages deselected
class DeselectAllPressed extends MessagesEvent {}

/// Selected messages deleted
class DeleteSelectedPressed extends MessagesEvent {}

/// User finished selection mode
class SelectionModeFinished extends MessagesEvent {}

/// User deleted the message
class MessageSendPressed extends MessagesEvent {
  const MessageSendPressed({required this.message});

  final MessageInfo message;

  @override
  List<Object> get props => [message];
}

/// User deleted the message
class DeletePressed extends MessagesEvent {
  const DeletePressed({required this.message});

  final Message message;

  @override
  List<Object> get props => [message];
}

/// Message sending process finished successfully
class MessageSentSuccess extends MessagesEvent {
  const MessageSentSuccess({required this.messages});

  final List<Message> messages;

  @override
  List<Object> get props => [messages];
}

/// Message sending process finished with error
class MessageSentFailure extends MessagesEvent {
  const MessageSentFailure({required this.message});

  final MessageInfo message;

  @override
  List<Object> get props => [message];
}

/// Message deletion process finished
class MessagesDeleted extends MessagesEvent {
  const MessagesDeleted({required this.isSuccess});

  final bool isSuccess;

  @override
  List<Object> get props => [isSuccess];
}

/// Session expired
class SessionExpired extends MessagesEvent {
  const SessionExpired();
}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends MessagesEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}
