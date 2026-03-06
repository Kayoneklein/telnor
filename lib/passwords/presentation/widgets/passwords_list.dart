import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/passwords/presentation/widgets/passwords_list_item.dart';

///Widget to display list of passwords
class PasswordList extends StatelessWidget {
  const PasswordList({
    required List<Password> passwords,
    required List<Team> myTeams,
    required List<TeamMember> myMembers,
    Function(int, Password)? onItemClicked,
    Function(int, Password)? onItemLongClicked,
    Function(int, Password)? onItemShare,
    Function(int, Password)? onItemEdit,
    Function(int, Password)? onItemDeleted,
    Function(int, Password)? onShareInfoClicked,
    bool? isSharingAvailable,
    bool? isSelectionMode,
    Set<int>? selectedIds,
  }) : _data = passwords,
       _myMembers = myMembers,
       _myTeams = myTeams,
       _onItemClicked = onItemClicked,
       _onItemLongClicked = onItemLongClicked,
       _onItemEdit = onItemEdit,
       _onItemShare = onItemShare,
       _onItemDeleted = onItemDeleted,
       _onShareInfoClicked = onShareInfoClicked,
       _isSharingAvailable = isSharingAvailable ?? false,
       _isSelectionMode = isSelectionMode ?? false,
       _selectedIds = selectedIds ?? const {};

  final List<Password> _data;
  final List<Team> _myTeams;
  final List<TeamMember> _myMembers;
  final Function(int, Password)? _onItemClicked;
  final Function(int, Password)? _onItemLongClicked;
  final Function(int, Password)? _onItemShare;
  final Function(int, Password)? _onItemEdit;
  final Function(int, Password)? _onItemDeleted;
  final Function(int, Password)? _onShareInfoClicked;
  final bool _isSharingAvailable;
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
          if (_data[position].isShared) {
            return PasswordSharedListItem(
              password: _data[position],
              onTap: () => _onItemClicked?.call(position, _data[position]),
              onLongPress: () =>
                  _onItemLongClicked?.call(position, _data[position]),
              onShareInfo: () =>
                  _onShareInfoClicked?.call(position, _data[position]),
              additionalPadding: _isSelectionMode,
            );
          } else {
            return PasswordListItem(
              password: _data[position],
              myMembers: _myMembers,
              myTeams: _myTeams,
              onTap: () => _onItemClicked?.call(position, _data[position]),
              onLongPress: () =>
                  _onItemLongClicked?.call(position, _data[position]),
              onShare: () => _onItemShare?.call(position, _data[position]),
              onEdit: () => _onItemEdit?.call(position, _data[position]),
              onDelete: () => _onItemDeleted?.call(position, _data[position]),
              isSharingAvailable: _isSharingAvailable,
              showCheckbox: _isSelectionMode,
              isChecked: _selectedIds.contains(_data[position].tempId),
            );
          }
        },
      ),
    );
  }
}
