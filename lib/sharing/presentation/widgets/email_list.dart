import 'package:flutter/material.dart';
import 'package:telnor/model/team.dart';

import 'email_list_item.dart';

///Widget to display list of users
class EmailList extends StatelessWidget {
  const EmailList({
    required List<TeamMember> members,
    Function(int, TeamMember)? onItemDeleted,
  }) : _data = members,
       _onItemDeleted = onItemDeleted;

  final List<TeamMember> _data;
  final Function(int, TeamMember)? _onItemDeleted;

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
      child: ListView.separated(
        scrollDirection: Axis.vertical,
        separatorBuilder: (BuildContext context, int index) =>
            const Divider(height: 1.0),
        itemCount: _data.length,
        itemBuilder: (context, position) {
          final member = _data[position];
          return EmailListItem(
            member: member,
            onDelete: () => _onItemDeleted?.call(position, member),
          );
        },
      ),
    );
  }
}
