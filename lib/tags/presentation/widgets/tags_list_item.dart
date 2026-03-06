import 'package:flutter/material.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/util/strings.dart';

/// Types of buttons to use in tags item action menu
enum TagsListItemAction { delete, edit }

/// Widget to display one tag line
class TagsListItem extends StatelessWidget {
  const TagsListItem({
    required Group group,
    Function()? onTap,
    Function()? onDelete,
  }) : _group = group,
       _onTap = onTap,
       _onDelete = onDelete;

  final Group _group;
  final Function()? _onTap;
  final Function()? _onDelete;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: _onTap,
      child: Padding(
        padding: const EdgeInsets.only(
          left: 20.0,
          right: 0.0,
          top: 4.0,
          bottom: 4.0,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Expanded(
              flex: 1,
              child: Text(
                _group.name,
                style: Theme.of(context).textTheme.headlineSmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            PopupMenuButton<TagsListItemAction>(
              icon: Icon(Icons.more_vert, color: Colors.grey[500]),
              onSelected: (value) {
                switch (value) {
                  case TagsListItemAction.delete:
                    _onDelete?.call();
                    break;
                  case TagsListItemAction.edit:
                    _onTap?.call();
                    break;
                }
              },
              padding: EdgeInsets.zero,
              itemBuilder: (BuildContext context) {
                return [
                  PopupMenuItem<TagsListItemAction>(
                    value: TagsListItemAction.edit,
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
                  PopupMenuItem<TagsListItemAction>(
                    value: TagsListItemAction.delete,
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
            ),
          ],
        ),
      ),
    );
  }
}
