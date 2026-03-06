import 'package:flutter/material.dart';
import 'package:telnor/model/team.dart';

/// Widget to display one user line
class MembersListItem extends StatelessWidget {
  const MembersListItem({
    required TeamMember member,
    Function()? onTap,
    bool? isChecked,
    bool? showTeam,
  }) : _member = member,
       _onTap = onTap,
       _isChecked = isChecked ?? false,
       _showTeam = showTeam ?? false;

  final TeamMember _member;
  final Function()? _onTap;
  final bool _isChecked;
  final bool _showTeam;

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
                  ? const Icon(Icons.done, color: Color(0xFFFFFFFF))
                  : null,
              backgroundImage: _isChecked
                  ? null
                  : _member.avatar?.isNotEmpty == true
                  ? MemoryImage(_member.avatar!) as ImageProvider
                  : const AssetImage('assets/user_default.png'),
            ),
            const SizedBox(width: 16.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: _member.name.isNotEmpty
                    ? <Widget>[
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: <Widget>[
                            if (_showTeam)
                              Text(
                                '${_member.teamName}: ',
                                style: Theme.of(context).textTheme.bodySmall,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            Expanded(
                              child: Text(
                                _member.name,
                                style: Theme.of(context).textTheme.bodyMedium,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          _member.email,
                          style: Theme.of(context).textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ]
                    : <Widget>[
                        Text(
                          _member.email,
                          style: Theme.of(context).textTheme.bodyMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
