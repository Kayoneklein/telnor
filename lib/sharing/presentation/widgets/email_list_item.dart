import 'package:flutter/material.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/util/strings.dart';

/// Widget to display one user line
class EmailListItem extends StatelessWidget {
  const EmailListItem({required TeamMember member, Function()? onDelete})
    : _member = member,
      _onDelete = onDelete;

  final TeamMember _member;
  final Function()? _onDelete;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        left: 16.0,
        right: 4.0,
        top: 8.0,
        bottom: 8.0,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.max,
        children: <Widget>[
          CircleAvatar(
            radius: 16.0,
            backgroundColor: Colors.grey[300],
            backgroundImage: const AssetImage('assets/user_default.png'),
          ),
          const SizedBox(width: 16.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  _member.email,
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  _member.teamName,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8.0),
          IconButton(
            icon: const Icon(Icons.delete),
            tooltip: Strings.actionDelete,
            color: Colors.grey,
            onPressed: _onDelete,
          ),
        ],
      ),
    );
  }
}
