import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:telnor/constants/colors.dart';
import 'package:telnor/messages/bloc/messages_bloc.dart';
import 'package:telnor/messages/bloc/messages_event.dart';
import 'package:telnor/messages/bloc/messages_state.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/sorting_order.dart';
import 'package:telnor/util/strings.dart';

///[AppBar] user on the messages screen
class MessagesAppBar extends StatefulWidget implements PreferredSizeWidget {
  const MessagesAppBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  State createState() => _MessagesAppBarState();
}

///State for [MessagesAppBar]
class _MessagesAppBarState extends State<MessagesAppBar> {
  late final MessagesBloc _bloc;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<MessagesBloc>(context);
    _searchController.addListener(
      () => _bloc.add(SearchTextChanged(text: _searchController.text)),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MessagesBloc, MessagesState>(
      builder: (context, state) => _buildAppBar(context, _bloc.state),
    );
  }

  /// Top screen bar
  AppBar _buildAppBar(BuildContext context, MessagesState state) {
    if (state.isSearchVisible) {
      if (_searchController.text != state.searchQuery) {
        _searchController.text = state.searchQuery;
      }
      return AppBar(
        title: PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool? pop, result) {
            _bloc.add(const SearchVisibilityChanged(visible: false));
          },
          child: TextFormField(
            controller: _searchController,
            autofocus: true,
            style: Theme.of(context).primaryTextTheme.headlineSmall,
            cursorColor: Theme.of(context).primaryTextTheme.bodyMedium?.color,
            decoration: InputDecoration(
              hintText: Strings.actionSearch,
              hintStyle: Theme.of(context).primaryTextTheme.bodyMedium,
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: Theme.of(context).primaryTextTheme.bodyMedium!.color!,
                ),
              ),
            ),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: Strings.actionClose,
          onPressed: () {
            _bloc.add(const SearchVisibilityChanged(visible: false));
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear),
            tooltip: Strings.actionClear,
            onPressed: () {
              _bloc.add(const SearchTextChanged(text: ''));
            },
          ),
        ],
      );
    } else if (state.selectionModeActive) {
      return AppBar(
        title: PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool? pop, result) {
            _bloc.add(SelectionModeFinished());
          },
          child: Text(
            '${Strings.messagesSelected} ${state.selectedMessageIds.length}',
          ),
        ),
        backgroundColor: Colors.grey,
        leading: IconButton(
          icon: const Icon(Icons.close),
          tooltip: Strings.actionClose,
          onPressed: () {
            _bloc.add(SelectionModeFinished());
          },
        ),
        actions: [
          (state.selectedMessageIds.length < state.displayedMessages.length)
              ? IconButton(
                  icon: const Icon(FontAwesomeIcons.squareCheck),
                  tooltip: Strings.actionSelectAll,
                  onPressed: () {
                    _selectAllMessages(context);
                  },
                )
              : IconButton(
                  icon: const Icon(FontAwesomeIcons.square),
                  tooltip: Strings.actionDeselectAll,
                  onPressed: () {
                    _deselectAllMessages(context);
                  },
                ),
          IconButton(
            icon: const Icon(Icons.delete),
            tooltip: Strings.actionDelete,
            onPressed: () {
              if (state.selectedMessageIds.isNotEmpty) {
                _deleteSelectedMessages(context);
              }
            },
          ),
        ],
      );
    } else {
      return AppBar(
        title: DropdownButtonHideUnderline(
          child: DropdownButton<MessagesBox>(
            value: state.currentBox,
            isExpanded: false,
            style: Theme.of(context).primaryTextTheme.bodyMedium,
            selectedItemBuilder: (context) => [
              Center(child: Text(Strings.messagesInbox)),
              Center(child: Text(Strings.messagesOutbox)),
            ],
            icon: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Icon(
                Icons.keyboard_arrow_down,
                color: Theme.of(context).primaryIconTheme.color,
              ),
            ),
            items: [
              DropdownMenuItem<MessagesBox>(
                value: MessagesBox.inbox,
                child: Text(
                  Strings.messagesInbox,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              DropdownMenuItem<MessagesBox>(
                value: MessagesBox.outbox,
                child: Text(
                  Strings.messagesOutbox,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ],
            onChanged: (value) {
              if (value != null) {
                _bloc.add(CurrentBoxChanged(box: value));
              }
            },
          ),
        ),
        actions: [
          _buildSearchButton(context, state),
          _buildSortingButton(context, state),
        ],
      );
    }
  }

  /// Action button to search passwords
  Widget _buildSearchButton(BuildContext context, MessagesState state) {
    if (state.isMessagesAvailable) {
      return IconButton(
        icon: const Icon(Icons.search),
        tooltip: Strings.actionSearch,
        onPressed: () {
          _bloc.add(const SearchVisibilityChanged(visible: true));
        },
      );
    } else {
      return const SizedBox(width: 0.0);
    }
  }

  /// Action button to filter list of messages
  Widget _buildSortingButton(BuildContext context, MessagesState state) {
    if (state.isMessagesAvailable && state.allSortingOrders.isNotEmpty) {
      return PopupMenuButton<MessageSortingOrder>(
        icon: const Icon(Icons.sort),
        tooltip: Strings.actionSort,
        onSelected: (value) {
          _bloc.add(SortingOrderChanged(order: value));
        },
        padding: EdgeInsets.zero,
        itemBuilder: (BuildContext context) {
          return state.allSortingOrders
              .map(
                (o) => PopupMenuItem<MessageSortingOrder>(
                  value: o,
                  child: Row(
                    children: <Widget>[
                      IgnorePointer(
                        child: RadioGroup(
                          groupValue: state.currentSortingOrder,
                          onChanged: (_) {},
                          child: Radio(value: o),
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: Text(
                          _sortingOrderTitle(o),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              )
              .toList();
        },
      );
    } else {
      return const SizedBox(width: 0.0);
    }
  }

  /// Get title to display on sorting order page
  String _sortingOrderTitle(MessageSortingOrder order) {
    switch (order) {
      case MessageSortingOrder.subjectAZ:
        return Strings.sortingOrderSubjectAZ;
      case MessageSortingOrder.subjectZA:
        return Strings.sortingOrderSubjectZA;
      case MessageSortingOrder.memberAZ:
        return Strings.sortingOrderMemberAZ;
      case MessageSortingOrder.memberZA:
        return Strings.sortingOrderMemberZA;
      case MessageSortingOrder.created:
        return Strings.sortingOrderCreated;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Select all messages
  void _selectAllMessages(BuildContext context) {
    _bloc.add(SelectAllPressed());
  }

  /// Deselect all messages
  void _deselectAllMessages(BuildContext context) {
    _bloc.add(DeselectAllPressed());
  }

  /// Delete selected messages (with confirmation)
  void _deleteSelectedMessages(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (BuildContext c) {
        return AlertDialog(
          content: Text(Strings.messagesDeleteSelectedConfirmation),
          actions: <Widget>[
            TextButton(
              child: Text(Strings.actionNo.toUpperCase()),
              onPressed: () {
                Navigator.of(c).pop();
              },
            ),
            TextButton(
              child: Text(Strings.actionYes.toUpperCase()),
              onPressed: () {
                Navigator.of(c).pop();
                _bloc.add(DeleteSelectedPressed());
              },
            ),
          ],
        );
      },
    );
  }
}
