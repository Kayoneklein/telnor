import 'package:flutter/material.dart';
import 'package:telnor/model/team.dart';

/// Widget to display one team line
class TeamsListItem extends StatelessWidget {
  const TeamsListItem({required Team team, Function()? onTap, bool? isChecked})
    : _team = team,
      _onTap = onTap,
      _isChecked = isChecked ?? false;

  final Team _team;
  final Function()? _onTap;
  final bool _isChecked;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: _onTap,
      child: Padding(
        padding: const EdgeInsets.only(
          left: 16.0,
          right: 16,
          top: 12.0,
          bottom: 12.0,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            CircleAvatar(
              radius: 16.0,
              backgroundColor: _isChecked
                  ? Theme.of(context).colorScheme.secondary
                  : Colors.grey[300],
              child: _isChecked
                  ? Icon(
                      Icons.done,
                      color: Theme.of(context).colorScheme.onSecondary,
                    )
                  : Icon(Icons.people, color: Colors.grey[500]),
              backgroundImage: null,
            ),
            const SizedBox(width: 16.0),
            Text(
              _team.name,
              style: Theme.of(context).textTheme.bodyMedium,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
