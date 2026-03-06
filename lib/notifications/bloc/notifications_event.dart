import 'package:equatable/equatable.dart';
import 'package:telnor/model/global_message.dart';

abstract class NotificationsEvent extends Equatable {
  const NotificationsEvent();

  @override
  List<Object> get props => [];
}

/// User retried to load notifications
class RetryPressed extends NotificationsEvent {}

/// Global messages finished loading
class GlobalMessagesLoaded extends NotificationsEvent {
  const GlobalMessagesLoaded({required this.isSuccess, this.messages});

  final bool isSuccess;
  final List<GlobalMessage>? messages;

  @override
  List<Object> get props => [isSuccess, messages ?? const <GlobalMessage>[]];
}

/// Global message count finished loading
class GlobalMessageCountLoaded extends NotificationsEvent {
  const GlobalMessageCountLoaded({required this.isSuccess, this.count});

  final bool isSuccess;
  final int? count;

  @override
  List<Object> get props => [isSuccess, count ?? 0];
}

/// User opened notifications tab
class NotificationsTabOpened extends NotificationsEvent {}

/// Session expired
class SessionExpired extends NotificationsEvent {
  const SessionExpired();
}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends NotificationsEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}
