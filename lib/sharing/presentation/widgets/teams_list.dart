import 'package:flutter/material.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/sharing/presentation/widgets/teams_list_item.dart';

///Widget to display list of teams
class TeamsList extends StatelessWidget {
  const TeamsList({
    required List<Team> teams,
    Function(int, Team)? onItemClicked,
    Set<int>? selectedIds,
  }) : _data = teams,
       _onItemClicked = onItemClicked,
       _selectedIds = selectedIds ?? const {};

  final List<Team> _data;
  final Function(int, Team)? _onItemClicked;
  final Set<int> _selectedIds;

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
          final team = _data[position];
          return TeamsListItem(
            team: team,
            onTap: () => _onItemClicked?.call(position, team),
            isChecked: _selectedIds.contains(team.id),
          );
        },
      ),
    );
  }
}
