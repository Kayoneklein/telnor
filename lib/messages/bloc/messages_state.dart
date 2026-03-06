import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/sorting_order.dart';

class MessagesState extends Equatable {
  const MessagesState({
    required this.currentBox,
    required this.isMessagesAvailable,
    required this.inboxMessages,
    required this.outboxMessages,
    required this.displayedMessages,
    required this.allSortingOrders,
    required this.currentSortingOrder,
    required this.isSearchVisible,
    required this.searchQuery,
    required this.selectionModeActive,
    required this.selectedMessageIds,
    required this.isLoading,
    required this.isLoadingError,
  });

  factory MessagesState.initial() => MessagesState(
    currentBox: MessagesBox.inbox,
    isMessagesAvailable: false,
    inboxMessages: BuiltList.from(<Message>[]),
    outboxMessages: BuiltList.from(<Message>[]),
    displayedMessages: BuiltList.from(<Message>[]),
    allSortingOrders: BuiltList.from(<MessageSortingOrder>[
      MessageSortingOrder.subjectAZ,
      MessageSortingOrder.subjectZA,
      MessageSortingOrder.memberAZ,
      MessageSortingOrder.memberZA,
      MessageSortingOrder.created,
    ]),
    currentSortingOrder: MessageSortingOrder.created,
    isSearchVisible: false,
    searchQuery: '',
    selectionModeActive: false,
    selectedMessageIds: BuiltSet(<int>{}),
    isLoading: true,
    isLoadingError: false,
  );

  final MessagesBox currentBox;
  final bool isMessagesAvailable;
  final BuiltList<Message> inboxMessages;
  final BuiltList<Message> outboxMessages;
  final BuiltList<Message> displayedMessages;
  final BuiltList<MessageSortingOrder> allSortingOrders;
  final MessageSortingOrder currentSortingOrder;
  final bool isSearchVisible;
  final String searchQuery;
  final bool selectionModeActive;
  final BuiltSet<int> selectedMessageIds;
  final bool isLoading;
  final bool isLoadingError;

  int get newMessagesCount =>
      (inboxMessages + outboxMessages).where((m) => !m.isRead).length;

  MessagesState copyWith({
    MessagesBox? currentBox,
    bool? isMessagesAvailable,
    BuiltList<Message>? inboxMessages,
    BuiltList<Message>? outboxMessages,
    BuiltList<Message>? displayedMessages,
    BuiltList<MessageSortingOrder>? allSortingOrders,
    MessageSortingOrder? currentSortingOrder,
    bool? isSearchVisible,
    String? searchQuery,
    bool? selectionModeActive,
    BuiltSet<int>? selectedMessageIds,
    bool? isLoading,
    bool? isLoadingError,
  }) {
    return MessagesState(
      currentBox: currentBox ?? this.currentBox,
      isMessagesAvailable: isMessagesAvailable ?? this.isMessagesAvailable,
      inboxMessages: inboxMessages ?? this.inboxMessages,
      outboxMessages: outboxMessages ?? this.outboxMessages,
      displayedMessages: displayedMessages ?? this.displayedMessages,
      allSortingOrders: allSortingOrders ?? this.allSortingOrders,
      currentSortingOrder: currentSortingOrder ?? this.currentSortingOrder,
      isSearchVisible: isSearchVisible ?? this.isSearchVisible,
      searchQuery: searchQuery ?? this.searchQuery,
      selectionModeActive: selectionModeActive ?? this.selectionModeActive,
      selectedMessageIds: selectedMessageIds ?? this.selectedMessageIds,
      isLoading: isLoading ?? this.isLoading,
      isLoadingError: isLoadingError ?? this.isLoadingError,
    );
  }

  @override
  List<Object> get props => [
    currentBox,
    isMessagesAvailable,
    inboxMessages,
    outboxMessages,
    displayedMessages,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedMessageIds,
    isLoading,
    isLoadingError,
  ];
}

/// Notifies the screen about message being recently sent
class MessageSentState extends MessagesState {
  MessageSentState.from(
    MessagesState state, {
    required this.isSuccess,
    this.message,
  }) : super(
         currentBox: state.currentBox,
         isMessagesAvailable: state.isMessagesAvailable,
         inboxMessages: state.inboxMessages,
         outboxMessages: state.outboxMessages,
         displayedMessages: state.displayedMessages,
         allSortingOrders: state.allSortingOrders,
         currentSortingOrder: state.currentSortingOrder,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         selectionModeActive: state.selectionModeActive,
         selectedMessageIds: state.selectedMessageIds,
         isLoading: state.isLoading,
         isLoadingError: state.isLoadingError,
       );

  final bool isSuccess;
  final MessageInfo? message;

  @override
  List<Object> get props => [
    currentBox,
    isMessagesAvailable,
    inboxMessages,
    outboxMessages,
    displayedMessages,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedMessageIds,
    isLoading,
    isLoadingError,
    isSuccess,
  ];
}

/// Notifies the screen about messages being recently deleted
class MessagesDeletedState extends MessagesState {
  MessagesDeletedState.from(MessagesState state, {required this.isSuccess})
    : super(
        currentBox: state.currentBox,
        isMessagesAvailable: state.isMessagesAvailable,
        inboxMessages: state.inboxMessages,
        outboxMessages: state.outboxMessages,
        displayedMessages: state.displayedMessages,
        allSortingOrders: state.allSortingOrders,
        currentSortingOrder: state.currentSortingOrder,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        selectionModeActive: state.selectionModeActive,
        selectedMessageIds: state.selectedMessageIds,
        isLoading: state.isLoading,
        isLoadingError: state.isLoadingError,
      );

  final bool isSuccess;

  @override
  List<Object> get props => [
    currentBox,
    isMessagesAvailable,
    inboxMessages,
    outboxMessages,
    displayedMessages,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedMessageIds,
    isLoading,
    isLoadingError,
    isSuccess,
  ];
}

/// Log out from the system
class SessionExpiredState extends MessagesState {
  SessionExpiredState()
    : super(
        currentBox: MessagesBox.inbox,
        isMessagesAvailable: false,
        inboxMessages: BuiltList.from(<Message>[]),
        outboxMessages: BuiltList.from(<Message>[]),
        displayedMessages: BuiltList.from(<Message>[]),
        allSortingOrders: BuiltList(<MessageSortingOrder>[]),
        currentSortingOrder: MessageSortingOrder.subjectAZ,
        isSearchVisible: false,
        searchQuery: '',
        selectionModeActive: false,
        selectedMessageIds: BuiltSet(<int>{}),
        isLoading: false,
        isLoadingError: false,
      );
}

/// Notifies the screen about messages being recently deleted
class ConnectionErrorState extends MessagesState {
  ConnectionErrorState.from(MessagesState state, {required this.errorMessage})
    : super(
        currentBox: state.currentBox,
        isMessagesAvailable: state.isMessagesAvailable,
        inboxMessages: state.inboxMessages,
        outboxMessages: state.outboxMessages,
        displayedMessages: state.displayedMessages,
        allSortingOrders: state.allSortingOrders,
        currentSortingOrder: state.currentSortingOrder,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        selectionModeActive: state.selectionModeActive,
        selectedMessageIds: state.selectedMessageIds,
        isLoading: false,
        isLoadingError: true,
      );

  final String errorMessage;

  @override
  List<Object> get props => [
    currentBox,
    isMessagesAvailable,
    inboxMessages,
    outboxMessages,
    displayedMessages,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedMessageIds,
    isLoading,
    isLoadingError,
    errorMessage,
  ];
}
