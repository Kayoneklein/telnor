import 'package:flutter/material.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/util/strings.dart';

/// Widget for showing team selection dropdown
class TeamPicker extends StatelessWidget {
  const TeamPicker({
    required List<Team> teams,
    required bool includeAllTeams,
    required int selectedTeamId,
    required Function(int?) onSelectionChanged,
  }) : _teams = teams,
       _includeAllTeams = includeAllTeams,
       _selectedTeamId = selectedTeamId,
       _onSelectionChanged = onSelectionChanged;

  final List<Team> _teams;
  final bool _includeAllTeams;
  final int _selectedTeamId;
  final Function(int?) _onSelectionChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 4.0,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Text(Strings.memberPickerTeam),
            const SizedBox(width: 16.0),
            Expanded(
              child: ButtonTheme(
                alignedDropdown: true,
                child: DropdownButton<int>(
                  value: _selectedTeamId,
                  isExpanded: true,
                  items:
                      [
                        if (_includeAllTeams)
                          DropdownMenuItem<int>(
                            value: -1,
                            child: Text(
                              '-- ${Strings.memberPickerAll} --',
                              style: const TextStyle(color: Colors.grey),
                            ),
                          ),
                      ] +
                      _teams
                          .map(
                            (Team t) => DropdownMenuItem<int>(
                              value: t.id,
                              child: Text(t.name),
                            ),
                          )
                          .toList(),
                  onChanged: _onSelectionChanged,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
