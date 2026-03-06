import 'package:flutter/material.dart';
import 'package:telnor/model/message.dart';

import 'messages_list_item.dart';

///Widget to display list of messages
class MessagesList extends StatelessWidget {
  const MessagesList({
    super.key,
    required List<Message> messages,
    Function(int, Message)? onItemClicked,
    Function(int, Message)? onItemLongClicked,
    bool? isSelectionMode,
    Set<int>? selectedIds,
  }) : _data = messages,
       _onItemClicked = onItemClicked,
       _onItemLongClicked = onItemLongClicked,
       _isSelectionMode = isSelectionMode ?? false,
       _selectedIds = selectedIds ?? const {};

  final List<Message> _data;
  final Function(int, Message)? _onItemClicked;
  final Function(int, Message)? _onItemLongClicked;
  final bool _isSelectionMode;
  final Set<int> _selectedIds;

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
      child: ListView.separated(
        scrollDirection: Axis.vertical,
        separatorBuilder: (BuildContext context, int index) =>
            const Divider(height: 1.0),
        itemCount: _data.length,
        itemBuilder: (context, position) {
          return MessageListItem(
            message: _data[position],
            onTap: () => _onItemClicked?.call(position, _data[position]),
            onLongPress: () =>
                _onItemLongClicked?.call(position, _data[position]),
            showCheckbox: _isSelectionMode,
            isChecked: _selectedIds.contains(_data[position].mailId),
          );
        },
      ),
    );
  }
}
