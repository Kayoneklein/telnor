import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/global_message.dart';

class NotificationsState extends Equatable {
  const NotificationsState({
    required this.globalMessageCount,
    required this.globalMessages,
    required this.isNotificationsAvailable,
    required this.isLoading,
    required this.isLoadingError,
  });

  factory NotificationsState.initial() => NotificationsState(
    globalMessageCount: 0,
    globalMessages: BuiltList.from(<GlobalMessage>[]),
    isNotificationsAvailable: false,
    isLoading: true,
    isLoadingError: false,
  );

  final int globalMessageCount;
  final BuiltList<GlobalMessage> globalMessages;
  final bool isNotificationsAvailable;
  final bool isLoading;
  final bool isLoadingError;

  NotificationsState copyWith({
    int? globalMessageCount,
    BuiltList<GlobalMessage>? globalMessages,
    bool? isNotificationsAvailable,
    bool? isLoading,
    bool? isLoadingError,
  }) {
    return NotificationsState(
      globalMessageCount: globalMessageCount ?? this.globalMessageCount,
      globalMessages: globalMessages ?? this.globalMessages,
      isNotificationsAvailable:
          isNotificationsAvailable ?? this.isNotificationsAvailable,
      isLoading: isLoading ?? this.isLoading,
      isLoadingError: isLoadingError ?? this.isLoadingError,
    );
  }

  @override
  List<Object> get props => [
    globalMessageCount,
    globalMessages,
    isNotificationsAvailable,
    isLoading,
    isLoadingError,
  ];
}

/// Log out from the system
class SessionExpiredState extends NotificationsState {
  SessionExpiredState()
    : super(
        globalMessageCount: 0,
        globalMessages: BuiltList.from(<GlobalMessage>[]),
        isNotificationsAvailable: false,
        isLoading: false,
        isLoadingError: false,
      );
}

class ConnectionErrorState extends NotificationsState {
  ConnectionErrorState.from(
    NotificationsState state, {
    required this.errorMessage,
  }) : super(
         globalMessageCount: state.globalMessageCount,
         globalMessages: state.globalMessages,
         isLoading: false,
         isLoadingError: true,
         isNotificationsAvailable: state.isNotificationsAvailable,
       );

  final String errorMessage;

  @override
  List<Object> get props => [
    errorMessage,
    globalMessageCount,
    globalMessages,
    isNotificationsAvailable,
    isLoading,
    isLoadingError,
  ];
}
