import 'dart:async';
import 'package:bloc/bloc.dart';
import 'package:built_collection/built_collection.dart';
import 'package:telnor/model/global_message.dart';
import 'package:telnor/web/server_adapter.dart';
import './notifications.dart';

class NotificationsBloc extends Bloc<NotificationsEvent, NotificationsState> {
  NotificationsBloc() : super(NotificationsState.initial()) {
    _getGlobalMessageCount();
    _loadGlobalMessages();

    on<NotificationsEvent>((event, emit) {
      //User pressed 'Retry'
      if (event is RetryPressed) {
        emit(state.copyWith(isLoading: true, isLoadingError: false));
        _loadGlobalMessages();
      }
      //Messages finished loading
      if (event is GlobalMessagesLoaded) {
        if (event.isSuccess) {
          final messages = BuiltList<GlobalMessage>.from(event.messages!);
          emit(
            state.copyWith(
              isNotificationsAvailable: true,
              isLoading: false,
              isLoadingError: false,
              globalMessages: _filterMessages(messages),
            ),
          );
        } else {
          emit(
            state.copyWith(
              isNotificationsAvailable: false,
              isLoading: false,
              isLoadingError: true,
            ),
          );
        }
      }
      //Messages finished loading
      if (event is GlobalMessageCountLoaded) {
        if (event.isSuccess) {
          emit(state.copyWith(globalMessageCount: event.count));
        }
      }
      //User opened notifications tab
      if (event is NotificationsTabOpened) {
        _resetGlobalMessageCount();
      }

      //Session expired
      if (event is SessionExpired) {
        emit(SessionExpiredState());
      }

      if (event is ConnectionErrorEvent) {
        emit(
          ConnectionErrorState.from(state, errorMessage: event.errorMessage),
        );
      }
    });
  }

  final ServerAdapter _server = ServerAdapter.get;

  //--------------------------------------------------------------------------------------------------------------------

  /// Load number of global messages from remote server
  void _getGlobalMessageCount() {
    _server.getGlobalMessagesCount(
      onSuccess: (count) {
        add(GlobalMessageCountLoaded(isSuccess: true, count: count));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const GlobalMessageCountLoaded(isSuccess: false),
          );
        }
      },
    );
  }

  /// Reset number of global messages on remote server
  void _resetGlobalMessageCount() {
    _server.resetGlobalMessagesCount(
      onSuccess: () {
        _getGlobalMessageCount();
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        }
        //Do nothing
      },
    );
  }

  /// Load global messages from remote server
  void _loadGlobalMessages() {
    _server.loadGlobalMessages(
      onSuccess: (messages) {
        add(GlobalMessagesLoaded(isSuccess: true, messages: messages));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const GlobalMessagesLoaded(isSuccess: false),
          );
        }
      },
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Filter displayed notifications based on the current filters
  BuiltList<GlobalMessage> _filterMessages(BuiltList<GlobalMessage> messages) {
    final ListBuilder<GlobalMessage> builder = messages.toBuilder();
    builder.removeWhere((m) => m.isDraft);
    builder.sort(_getComparator());
    return builder.build();
  }

  /// Get appropriate comparator to sort list of global messages
  int Function(GlobalMessage, GlobalMessage) _getComparator() =>
      (GlobalMessage first, GlobalMessage second) {
        if (first.isSticky == second.isSticky) {
          return second.createdAt.compareTo(first.createdAt);
        }
        return (first.isSticky ? -1 : 0).compareTo(second.isSticky ? -1 : 0);
      };
}
