import 'package:flutter/material.dart';
import 'package:telnor/constants/assets.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/util/formatters.dart';

class MessageRemoteMember extends StatelessWidget {
  const MessageRemoteMember({super.key, required this.member, this.date});

  final TeamMember member;
  final DateTime? date;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        left: 16.0,
        right: 16.0,
        top: 16.0,
        bottom: 16.0,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          CircleAvatar(
            backgroundColor: Colors.grey[300],
            backgroundImage: member.avatar?.isNotEmpty == true
                ? MemoryImage(member.avatar!) as ImageProvider
                : const AssetImage(PImages.userDefault),
          ),
          const SizedBox(width: 16.0),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  mainAxisSize: MainAxisSize.max,
                  children: <Widget>[
                    Expanded(
                      flex: 1,
                      child: Text(
                        member.nonEmptyName,
                        style: Theme.of(context).textTheme.headlineSmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (date != null) const SizedBox(width: 4.0),
                    if (date != null)
                      Text(
                        formatMessageDate(date!),
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 1,
                      ),
                  ],
                ),
                const SizedBox(height: 4.0),
                Text(
                  member.department,
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 1,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
