import 'package:flutter/material.dart';
import 'package:telnor/model/filter.dart';

/// An item with sub menu for using in popup menus
///
/// [title] is the text which will be displayed in the pop up
/// [items] is the list of items to populate the sub menu
/// [onSelected] is the callback to be fired if specific item is pressed
///
/// Selecting items from the submenu will automatically close the parent menu
/// Closing the sub menu by clicking outside of it, will automatically close the parent menu
class PopupSubMenuItem<T> extends PopupMenuEntry<T> {
  const PopupSubMenuItem({
    required this.title,
    required this.items,
    required this.selectedFilter,
    this.onSelected,
  });

  final String title;
  final List<T> items;
  final Filter selectedFilter;
  final Function(T)? onSelected;

  @override
  double get height => kMinInteractiveDimension;

  @override
  bool represents(T? value) => false;

  @override
  State createState() => _PopupSubMenuState<T>();
}

/// The [State] for [PopupSubMenuItem] subclasses.
class _PopupSubMenuState<T> extends State<PopupSubMenuItem<T>> {
  @override
  Widget build(BuildContext context) {
    final currentFilterColor = Colors.yellow[100]!;
    const noCurrentFilterColor = Colors.transparent;
    return PopupMenuButton<T>(
      tooltip: widget.title,
      child: Container(
        color: widget.items.contains(widget.selectedFilter)
            ? currentFilterColor
            : noCurrentFilterColor,
        child: Padding(
          padding: const EdgeInsets.only(
            left: 16.0,
            right: 8.0,
            top: 12.0,
            bottom: 12.0,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.max,
            children: <Widget>[
              Expanded(child: Text(widget.title)),
              Icon(
                Icons.arrow_right,
                size: 24.0,
                color: Theme.of(context).iconTheme.color,
              ),
            ],
          ),
        ),
      ),
      onCanceled: () {
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
      },
      onSelected: (T value) {
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
        widget.onSelected?.call(value);
      },
      offset: Offset.zero,
      itemBuilder: (BuildContext context) {
        return widget.items
            .map(
              (item) => CustomPopupMenuItem(
                value: item,
                color: widget.selectedFilter.name == item.toString()
                    ? currentFilterColor
                    : noCurrentFilterColor,
                child: Text(item.toString()),
              ),
            )
            .toList();
      },
    );
  }
}

class CustomPopupMenuItem<T> extends PopupMenuItem<T> {
  const CustomPopupMenuItem({
    required T value,
    required Widget child,
    required this.color,
  }) : super(value: value, child: child);

  final Color color;

  @override
  _CustomPopupMenuItemState<T> createState() => _CustomPopupMenuItemState<T>();
}

class _CustomPopupMenuItemState<T>
    extends PopupMenuItemState<T, CustomPopupMenuItem<T>> {
  @override
  Widget build(BuildContext context) {
    return Container(child: super.build(context), color: widget.color);
  }
}
