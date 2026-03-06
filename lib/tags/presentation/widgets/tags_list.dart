import 'package:flutter/material.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/tags/presentation/widgets/tags_list_item.dart';

///Widget to display list of tags
class TagsList extends StatelessWidget {
  const TagsList({
    required List<Group> groups,
    Function(int, Group)? onItemClicked,
    Function(int, Group)? onItemDeleted,
  }) : _data = groups,
       _onItemClicked = onItemClicked,
       _onItemDeleted = onItemDeleted;

  final List<Group> _data;
  final Function(int, Group)? _onItemClicked;
  final Function(int, Group)? _onItemDeleted;

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
      child: ListView.separated(
        scrollDirection: Axis.vertical,
        separatorBuilder: (BuildContext context, int index) =>
            const Divider(height: 1.0),
        itemCount: _data.length,
        itemBuilder: (context, position) => TagsListItem(
          group: _data[position],
          onTap: () => _onItemClicked?.call(position, _data[position]),
          onDelete: () => _onItemDeleted?.call(position, _data[position]),
        ),
      ),
    );
  }
}
