import 'package:flutter/material.dart';
import 'package:telnor/model/team.dart';

import 'members_list_item.dart';

///Widget to display list of users
class MembersList extends StatelessWidget {
  const MembersList({
    required List<TeamMember> members,
    Function(int, TeamMember)? onItemClicked,
    Set<TeamMemberIdPair>? selectedIds,
    bool? showTeamNames,
  }) : _data = members,
       _onItemClicked = onItemClicked,
       _selectedIds = selectedIds ?? const {},
       _showTeamNames = showTeamNames ?? false;

  final List<TeamMember> _data;
  final Function(int, TeamMember)? _onItemClicked;
  final Set<TeamMemberIdPair> _selectedIds;
  final bool _showTeamNames;

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
      child: ListView.separated(
        scrollDirection: Axis.vertical,
        shrinkWrap: true,
        separatorBuilder: (BuildContext context, int index) =>
            const Divider(height: 1.0),
        itemCount: _data.length,
        itemBuilder: (context, position) {
          final member = _data[position];
          return MembersListItem(
            member: member,
            onTap: () => _onItemClicked?.call(position, member),
            isChecked: _selectedIds.contains(
              TeamMemberIdPair(memberId: member.userId, teamId: member.teamId),
            ),
            showTeam: _showTeamNames,
          );
        },
      ),
    );
  }
}
