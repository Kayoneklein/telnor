import 'package:flutter/material.dart';
import 'package:telnor/model/global_message.dart';

import 'notifications_list_item.dart';

///Widget to display list of notifications
class NotificationsList extends StatelessWidget {
  const NotificationsList({
    required List<GlobalMessage> notifications,
    Function(int, GlobalMessage)? onItemClicked,
    Function(int, GlobalMessage)? onItemLongClicked,
    bool? isSelectionMode,
    Set<int>? selectedIds,
  }) : _data = notifications,
       _onItemClicked = onItemClicked,
       _onItemLongClicked = onItemLongClicked,
       _isSelectionMode = isSelectionMode ?? false,
       _selectedIds = selectedIds ?? const {};

  final List<GlobalMessage> _data;
  final Function(int, GlobalMessage)? _onItemClicked;
  final Function(int, GlobalMessage)? _onItemLongClicked;
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
          return NotificationListItem(
            notification: _data[position],
            onTap: () => _onItemClicked?.call(position, _data[position]),
            onLongPress: () =>
                _onItemLongClicked?.call(position, _data[position]),
            showCheckbox: _isSelectionMode,
            isChecked: _selectedIds.contains(_data[position].id),
          );
        },
      ),
    );
  }
}
