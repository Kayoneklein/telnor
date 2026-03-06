import 'package:flutter/material.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/util/custom_icons.dart';
import 'package:telnor/util/strings.dart';

/// Types of buttons to use in password item action menu
enum PasswordListItemAction { share, edit, delete }

/// Widget to display one password line
class PasswordListItem extends StatelessWidget {
  const PasswordListItem({
    required Password password,
    required List<Team> myTeams,
    required List<TeamMember> myMembers,
    Function()? onTap,
    Function()? onLongPress,
    Function()? onShare,
    Function()? onEdit,
    Function()? onDelete,
    bool? isSharingAvailable,
    bool? showCheckbox,
    bool? isChecked,
  }) : _password = password,
       _myMembers = myMembers,
       _myTeams = myTeams,
       _onTap = onTap,
       _onLongPress = onLongPress,
       _onShare = onShare,
       _onEdit = onEdit,
       _onDelete = onDelete,
       _sharingAvailable = isSharingAvailable ?? false,
       _showCheckbox = showCheckbox ?? false,
       _isChecked = isChecked ?? false;

  final Password _password;
  final List<Team> _myTeams;
  final List<TeamMember> _myMembers;
  final Function()? _onTap;
  final Function()? _onLongPress;
  final Function()? _onShare;
  final Function()? _onEdit;
  final Function()? _onDelete;
  final bool _sharingAvailable;
  final bool _showCheckbox;
  final bool _isChecked;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: _onTap,
      onLongPress: _onLongPress,
      child: Padding(
        padding: _showCheckbox
            ? const EdgeInsets.only(
                left: 8.0,
                right: 0.0,
                top: 4.0,
                bottom: 4.0,
              )
            : const EdgeInsets.only(
                left: 20.0,
                right: 0.0,
                top: 4.0,
                bottom: 4.0,
              ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            _showCheckbox
                ? IgnorePointer(
                    child: Checkbox(value: _isChecked, onChanged: (_) {}),
                  )
                : Padding(
                    padding: const EdgeInsets.only(right: 12.0),
                    child: _password.icon != null
                        ? Image.memory(
                            _password.icon!,
                            height: 24.0,
                            width: 24.0,
                            errorBuilder: (_, error, stackTrace) {
                              return const SizedBox(
                                height: 24.0,
                                width: 24.0,
                                child: Placeholder(
                                  child: Icon(Icons.question_mark),
                                ),
                              );
                            },
                          )
                        : const SizedBox(height: 24.0, width: 24.0),
                  ),
            Expanded(
              flex: 1,
              child: Text(
                _password.name,
                style: Theme.of(context).textTheme.headlineSmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            !_showCheckbox
                ? PopupMenuButton<PasswordListItemAction>(
                    tooltip: Strings.actionMore,
                    icon: Icon(Icons.more_vert, color: Colors.grey[500]),
                    onSelected: (value) {
                      switch (value) {
                        case PasswordListItemAction.share:
                          _onShare?.call();
                          break;
                        case PasswordListItemAction.edit:
                          _onEdit?.call();
                          break;
                        case PasswordListItemAction.delete:
                          _onDelete?.call();
                          break;
                      }
                    },
                    padding: EdgeInsets.zero,
                    itemBuilder: (BuildContext context) {
                      bool isValidTeamOrMember = false;
                      if (_password.shares[0] != null) {
                        final myTeamIds = _myTeams
                            .map((team) => team.id)
                            .toSet();
                        final sharedTeamIds = _password.shares[0]!.toSet();
                        isValidTeamOrMember = myTeamIds
                            .intersection(sharedTeamIds)
                            .isNotEmpty;
                      } else {
                        final myMemberIds = _myMembers
                            .map((member) => member.userId)
                            .toSet();
                        final sharedMemberIds = _password.shares.keys.toSet();
                        isValidTeamOrMember = myMemberIds
                            .intersection(sharedMemberIds)
                            .isNotEmpty;
                      }
                      Color shareIconColor;
                      if (_password.shares.isEmpty || !isValidTeamOrMember) {
                        shareIconColor = Colors.black;
                      } else {
                        shareIconColor = Theme.of(
                          context,
                        ).colorScheme.secondary;
                      }
                      return [
                        if (_sharingAvailable)
                          PopupMenuItem<PasswordListItemAction>(
                            value: PasswordListItemAction.share,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: <Widget>[
                                Icon(Icons.share, color: shareIconColor),
                                const SizedBox(width: 12.0),
                                Text(Strings.actionShare),
                              ],
                            ),
                          ),
                        PopupMenuItem<PasswordListItemAction>(
                          value: PasswordListItemAction.edit,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: <Widget>[
                              const Icon(Icons.edit),
                              const SizedBox(width: 12.0),
                              Text(Strings.actionEdit),
                            ],
                          ),
                        ),
                        PopupMenuItem<PasswordListItemAction>(
                          value: PasswordListItemAction.delete,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: <Widget>[
                              const Icon(Icons.delete),
                              const SizedBox(width: 12.0),
                              Text(Strings.actionDelete),
                            ],
                          ),
                        ),
                      ];
                    },
                  )
                : const SizedBox(width: 16.0),
          ],
        ),
      ),
    );
  }
}

/// Widget to display one shared password line
class PasswordSharedListItem extends StatelessWidget {
  const PasswordSharedListItem({
    required Password password,
    Function()? onTap,
    Function()? onLongPress,
    Function()? onShareInfo,
    bool? additionalPadding,
  }) : _password = password,
       _onTap = onTap,
       _onLongPress = onLongPress,
       _onShareInfo = onShareInfo,
       _additionalPadding = additionalPadding ?? false;

  final Password _password;
  final Function()? _onTap;
  final Function()? _onLongPress;
  final Function()? _onShareInfo;
  final bool _additionalPadding;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: _password.isNewlyShared ? Colors.yellow[100] : Colors.grey[50],
      child: InkWell(
        onTap: _onTap,
        onLongPress: _onLongPress,
        child: Padding(
          padding: _additionalPadding
              ? const EdgeInsets.only(
                  left: 56.0,
                  right: 0.0,
                  top: 4.0,
                  bottom: 4.0,
                )
              : const EdgeInsets.only(
                  left: 20.0,
                  right: 0.0,
                  top: 4.0,
                  bottom: 4.0,
                ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.max,
            children: <Widget>[
              if (!_additionalPadding)
                Padding(
                  padding: const EdgeInsets.only(right: 12.0),
                  child: _password.icon != null
                      ? Image.memory(
                          _password.icon!,
                          height: 24.0,
                          width: 24.0,
                          errorBuilder: (_, error, stackTrace) {
                            return const SizedBox(
                              height: 24.0,
                              width: 24.0,
                              child: Placeholder(
                                child: Icon(Icons.question_mark),
                              ),
                            );
                          },
                        )
                      : const SizedBox(height: 24.0, width: 24.0),
                ),
              Expanded(
                flex: 1,
                child: Text(
                  _password.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              _additionalPadding
                  ? const SizedBox(height: 48.0)
                  : IconButton(
                      tooltip: Strings.actionShareInfo,
                      icon: Icon(
                        _password.teamKey != null
                            ? CustomIcons.share_team
                            : CustomIcons.share_user,
                        color: Colors.grey[500],
                      ),
                      onPressed: () {
                        _onShareInfo?.call();
                      }, //TODO
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
