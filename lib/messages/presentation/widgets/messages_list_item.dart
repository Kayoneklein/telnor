import 'package:flutter/material.dart';
import 'package:telnor/constants/assets.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/util/formatters.dart';

/// Widget to display one message line
class MessageListItem extends StatelessWidget {
  const MessageListItem({
    super.key,
    required Message message,
    Function()? onTap,
    Function()? onLongPress,
    bool? showCheckbox,
    bool? isChecked,
  }) : _message = message,
       _onTap = onTap,
       _onLongPress = onLongPress,
       _showCheckbox = showCheckbox ?? false,
       _isChecked = isChecked ?? false;

  final Message _message;
  final Function()? _onTap;
  final Function()? _onLongPress;
  final bool _showCheckbox;
  final bool _isChecked;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: _message.isRead ? Colors.grey[50] : Colors.yellow[100],
      child: InkWell(
        onTap: _onTap,
        onLongPress: _onLongPress,
        child: Padding(
          padding: _showCheckbox
              ? const EdgeInsets.only(
                  left: 16.0,
                  right: 16.0,
                  top: 12.0,
                  bottom: 12.0,
                )
              : const EdgeInsets.only(
                  left: 16.0,
                  right: 16.0,
                  top: 12.0,
                  bottom: 12.0,
                ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              CircleAvatar(
                backgroundColor: _isChecked
                    ? Theme.of(context).colorScheme.secondary
                    : Colors.grey[300],
                backgroundImage: _isChecked
                    ? null
                    : _message.remoteMember.avatar?.isNotEmpty == true
                    ? MemoryImage(_message.remoteMember.avatar!)
                          as ImageProvider
                    : const AssetImage(PImages.userDefault),
                child: _isChecked
                    ? const Icon(
                        Icons.done,
                        //color: Theme.of(context).accentIconTheme.color,
                        color: Color(0xFFFFFFFF),
                      )
                    : null,
              ),
              const SizedBox(width: 16.0),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      mainAxisSize: MainAxisSize.max,
                      children: <Widget>[
                        Expanded(
                          flex: 1,
                          child: Text(
                            _message.remoteMember.nonEmptyName,
                            style: Theme.of(context).textTheme.headlineSmall,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4.0),
                        Text(
                          formatMessageDate(_message.createdAt),
                          style: Theme.of(context).textTheme.bodySmall,
                          maxLines: 1,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      _message.subject,
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
      ),
    );
  }
}
