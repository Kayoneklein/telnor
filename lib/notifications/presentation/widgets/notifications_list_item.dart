import 'package:flutter/material.dart';
import 'package:telnor/model/global_message.dart';
import 'package:telnor/util/formatters.dart';

/// Widget to display one notification line
class NotificationListItem extends StatelessWidget {
  const NotificationListItem({
    required GlobalMessage notification,
    Function()? onTap,
    Function()? onLongPress,
    bool? showCheckbox,
    bool? isChecked,
  }) : _notification = notification,
       _onTap = onTap,
       _onLongPress = onLongPress,
       _showCheckbox = showCheckbox ?? false,
       _isChecked = isChecked ?? false;

  final GlobalMessage _notification;
  final Function()? _onTap;
  final Function()? _onLongPress;
  final bool _showCheckbox;
  final bool? _isChecked;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: /*_message.isRead ?*/ Colors.grey[50] /*: Colors.yellow[100]*/,
      child: InkWell(
        onTap: _onTap,
        onLongPress: _onLongPress,
        child: Padding(
          padding: _showCheckbox
              ? const EdgeInsets.only(
                  left: 4.0,
                  right: 16.0,
                  top: 9.0,
                  bottom: 9.0,
                )
              : const EdgeInsets.only(
                  left: 16.0,
                  right: 16.0,
                  top: 12.0,
                  bottom: 12.0,
                ),
          child: Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisSize: MainAxisSize.max,
                      children: <Widget>[
                        Expanded(
                          flex: 1,
                          child: Text(
                            _notification.topic,
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(
                                  fontWeight: _notification.isSticky
                                      ? FontWeight.w600
                                      : FontWeight.w400,
                                ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4.0),
                        Text(
                          formatMessageDate(_notification.createdAt),
                          style: Theme.of(context).textTheme.bodySmall,
                          maxLines: 1,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      _notification.content,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: _notification.isSticky
                            ? FontWeight.w600
                            : FontWeight.w400,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
