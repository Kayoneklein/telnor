import 'package:bloc/bloc.dart';
import 'package:built_collection/built_collection.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/sorting_order.dart';
import 'package:telnor/web/server_adapter.dart';
import './messages.dart';

class MessagesBloc extends Bloc<MessagesEvent, MessagesState> {
  MessagesBloc() : super(MessagesState.initial()) {
    _loadMessages();

    on<MessagesEvent>((event, emit) {
      //User pressed 'Retry'
      if (event is RetryPressed) {
        emit(state.copyWith(isLoading: true, isLoadingError: false));
        _loadMessages();
      }
      //User changed current box
      if (event is CurrentBoxChanged) {
        emit(
          state.copyWith(
            currentBox: event.box,
            isSearchVisible: false,
            searchQuery: '',
            displayedMessages: _filterMessages(
              event.box,
              state.inboxMessages,
              state.outboxMessages,
              state.currentSortingOrder,
              '',
            ),
          ),
        );
      }
      //Messages finished loading
      if (event is MessagesLoaded) {
        if (event.isSuccess) {
          final inbox = BuiltList<Message>.from(event.inbox!);
          final outbox = BuiltList<Message>.from(event.outbox!);
          emit(
            state.copyWith(
              isMessagesAvailable: true,
              isLoading: false,
              isLoadingError: false,
              inboxMessages: inbox,
              outboxMessages: outbox,
              displayedMessages: _filterMessages(
                state.currentBox,
                inbox,
                outbox,
                state.currentSortingOrder,
                state.searchQuery,
              ),
            ),
          );
        } else {
          emit(
            state.copyWith(
              isMessagesAvailable: false,
              isLoading: false,
              isLoadingError: true,
            ),
          );
        }
      }
      //Sorting order changed applied
      if (event is SortingOrderChanged) {
        if (!state.isLoadingError && !state.isLoading) {
          emit(
            state.copyWith(
              currentSortingOrder: event.order,
              displayedMessages: _filterMessages(
                state.currentBox,
                state.inboxMessages,
                state.outboxMessages,
                event.order,
                state.searchQuery,
              ),
            ),
          );
        }
      }
      //Search view opened or closed
      if (event is SearchVisibilityChanged) {
        emit(
          state.copyWith(
            isSearchVisible: event.visible,
            displayedMessages: _filterMessages(
              state.currentBox,
              state.inboxMessages,
              state.outboxMessages,
              state.currentSortingOrder,
              state.searchQuery,
            ),
          ),
        );
        add(const SearchTextChanged(text: ''));
      }
      //Search query changed
      if (event is SearchTextChanged) {
        emit(
          state.copyWith(
            searchQuery: event.text,
            displayedMessages: _filterMessages(
              state.currentBox,
              state.inboxMessages,
              state.outboxMessages,
              state.currentSortingOrder,
              event.text,
            ),
          ),
        );
      }
      //Message pressed
      if (event is MessagePressed) {
        if (state.selectionModeActive) {
          emit(
            state.copyWith(
              selectedMessageIds: _toggleSetItem(
                state.selectedMessageIds,
                event.message.mailId,
              ),
            ),
          );
        }
      }
      //Message long pressed
      if (event is MessageLongPressed) {
        if (state.selectionModeActive) {
          emit(
            state.copyWith(
              selectedMessageIds: _toggleSetItem(
                state.selectedMessageIds,
                event.message.mailId,
              ),
            ),
          );
        } else if (!state.isSearchVisible) {
          emit(
            state.copyWith(
              selectionModeActive: true,
              selectedMessageIds: BuiltSet.from(<int>{event.message.mailId}),
            ),
          );
        }
      }
      //All passwords selected
      if (event is SelectAllPressed) {
        emit(
          state.copyWith(
            selectedMessageIds: BuiltSet.from(
              state.displayedMessages.map<int>((m) => m.mailId),
            ),
          ),
        );
      }
      //All passwords deselected
      if (event is DeselectAllPressed) {
        emit(state.copyWith(selectedMessageIds: BuiltSet.from(<int>[])));
      }
      //User closed selection mode
      if (event is SelectionModeFinished) {
        emit(
          state.copyWith(
            selectionModeActive: false,
            selectedMessageIds: BuiltSet(<int>{}),
          ),
        );
      }
      //User send new message
      if (event is MessageSendPressed) {
        emit(state.copyWith(isLoading: true));
        _sendMessage(event.message);
      }
      //Sending process finished successfully
      if (event is MessageSentSuccess) {
        final outbox = state.outboxMessages.rebuild(
          (b) => b.addAll(event.messages),
        );
        emit(
          MessageSentState.from(
            state.copyWith(
              outboxMessages: outbox,
              displayedMessages: _filterMessages(
                state.currentBox,
                state.inboxMessages,
                outbox,
                state.currentSortingOrder,
                state.searchQuery,
              ),
              isLoading: false,
            ),
            isSuccess: true,
          ),
        );
      }
      //Sending process finished with error
      if (event is MessageSentFailure) {
        emit(
          MessageSentState.from(
            state.copyWith(isLoading: false),
            isSuccess: false,
            message: event.message,
          ),
        );
      }
      //User deleted selected messages
      if (event is DeleteSelectedPressed) {
        _deleteMessages(
          state.displayedMessages
              .where((m) => state.selectedMessageIds.contains(m.mailId))
              .toList(),
        );
        switch (state.currentBox) {
          case MessagesBox.inbox:
            final inbox = state.inboxMessages.rebuild(
              (b) => b.removeWhere(
                (m) => state.selectedMessageIds.contains(m.mailId),
              ),
            );
            emit(
              state.copyWith(
                inboxMessages: inbox,
                displayedMessages: _filterMessages(
                  state.currentBox,
                  inbox,
                  state.outboxMessages,
                  state.currentSortingOrder,
                  '',
                ),
                selectionModeActive: false,
                selectedMessageIds: BuiltSet.from(<int>{}),
                isLoading: true,
              ),
            );
            break;
          case MessagesBox.outbox:
            final outbox = state.outboxMessages.rebuild(
              (b) => b.removeWhere(
                (m) => state.selectedMessageIds.contains(m.mailId),
              ),
            );
            emit(
              state.copyWith(
                outboxMessages: outbox,
                displayedMessages: _filterMessages(
                  state.currentBox,
                  state.inboxMessages,
                  outbox,
                  state.currentSortingOrder,
                  '',
                ),
                selectionModeActive: false,
                selectedMessageIds: BuiltSet.from(<int>{}),
                isLoading: true,
              ),
            );
            break;
        }
      }
      //User deleted single message
      if (event is DeletePressed) {
        _deleteMessages([event.message]);
        switch (state.currentBox) {
          case MessagesBox.inbox:
            final inbox = state.inboxMessages.rebuild(
              (b) => b.removeWhere((m) => m.mailId == event.message.mailId),
            );
            emit(
              state.copyWith(
                inboxMessages: inbox,
                displayedMessages: _filterMessages(
                  state.currentBox,
                  inbox,
                  state.outboxMessages,
                  state.currentSortingOrder,
                  state.searchQuery,
                ),
                isLoading: true,
              ),
            );
            break;
          case MessagesBox.outbox:
            final outbox = state.outboxMessages.rebuild(
              (b) => b.removeWhere((m) => m.mailId == event.message.mailId),
            );
            emit(
              state.copyWith(
                outboxMessages: outbox,
                displayedMessages: _filterMessages(
                  state.currentBox,
                  state.inboxMessages,
                  outbox,
                  state.currentSortingOrder,
                  state.searchQuery,
                ),
                isLoading: true,
              ),
            );
            break;
        }
      }
      //Deletion process finished
      if (event is MessagesDeleted) {
        emit(
          MessagesDeletedState.from(
            state.copyWith(isLoading: false),
            isSuccess: event.isSuccess,
          ),
        );
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

  /// Load messages from remote server
  void _loadMessages() {
    _server.loadMessages(
      onSuccess: (inbox, outbox) {
        add(MessagesLoaded(isSuccess: true, inbox: inbox, outbox: outbox));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const MessagesLoaded(isSuccess: false),
          );
        }
      },
    );
  }

  /// Send message to remote server
  void _sendMessage(MessageInfo message) {
    _server.sendMessage(
      messageInfo: message,
      onSuccess: (messages) {
        add(MessageSentSuccess(messages: messages));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : MessageSentFailure(message: message),
          );
        }
      },
    );
  }

  /// Delete specific messages
  void _deleteMessages(List<Message> messages) {
    _server.deleteMessages(
      messages: messages,
      onSuccess: () {
        add(const MessagesDeleted(isSuccess: true));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const MessagesDeleted(isSuccess: false),
          );
        }
      },
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Filter displayed messages based on the current filters
  BuiltList<Message> _filterMessages(
    MessagesBox currentBox,
    BuiltList<Message> inbox,
    BuiltList<Message> outbox,
    MessageSortingOrder order,
    String searchQuery,
  ) {
    final ListBuilder<Message> builder = currentBox == MessagesBox.inbox
        ? inbox.toBuilder()
        : outbox.toBuilder();
    if (searchQuery.isNotEmpty) {
      builder.retainWhere(
        (m) =>
            m.subject.toLowerCase().contains(searchQuery.toLowerCase()) ||
            m.message.toLowerCase().contains(searchQuery.toLowerCase()),
      );
    }
    builder.sort(_getComparator(order));
    return builder.build();
  }

  /// Get appropriate comparator to sort list of messages (based on the provided [MessageSortingOrder])
  int Function(Message, Message) _getComparator(MessageSortingOrder order) {
    switch (order) {
      case MessageSortingOrder.subjectAZ:
        return (Message first, Message second) =>
            first.subject.toLowerCase().compareTo(second.subject.toLowerCase());
      case MessageSortingOrder.subjectZA:
        return (Message first, Message second) =>
            second.subject.toLowerCase().compareTo(first.subject.toLowerCase());
      case MessageSortingOrder.memberAZ:
        return (Message first, Message second) => first
            .remoteMember
            .nonEmptyName
            .toLowerCase()
            .compareTo(second.remoteMember.nonEmptyName.toLowerCase());
      case MessageSortingOrder.memberZA:
        return (Message first, Message second) =>
            second.subject.toLowerCase().compareTo(first.subject.toLowerCase());
      case MessageSortingOrder.created:
        return (Message first, Message second) =>
            second.createdAt.compareTo(first.createdAt);
    }
  }

  /// If [set] contains an [item], delete this item. Otherwise, add [item] to the [set].
  /// Return new [Set] instance in both cases
  BuiltSet<T> _toggleSetItem<T>(BuiltSet<T> set, T item) {
    if (set.contains(item)) {
      return set.rebuild((b) => b.remove(item));
    } else {
      return set.rebuild((b) => b.add(item));
    }
  }
}
