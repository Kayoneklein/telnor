part of '../../index.dart';

/// Screen to display message details
class MessageDetailsScreen extends StatelessWidget {
  const MessageDetailsScreen(this.message, this.box, {super.key});

  final Message message;
  final MessagesBox box;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: true,
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.reply),
            tooltip: Strings.actionReply,
            onPressed: () {
              _replyMessage(context);
            },
          ),
          IconButton(
            icon: const Icon(Icons.forward),
            tooltip: Strings.actionForward,
            onPressed: () {
              _forwardMessage(context);
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            tooltip: Strings.actionDelete,
            onPressed: () {
              _deleteMessage(context);
            },
          ),
        ],
      ),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    return Scrollbar(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(
                left: 16.0,
                right: 16.0,
                top: 16.0,
              ),
              child: Text(
                box == MessagesBox.inbox
                    ? Strings.messageFrom
                    : Strings.messageTo,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            MessageRemoteMember(
              member: message.remoteMember,
              date: message.createdAt,
            ),
            const Divider(height: 1.0),
            Padding(
              padding: const EdgeInsets.only(
                left: 16.0,
                right: 16.0,
                top: 16.0,
              ),
              child: Text(
                Strings.messageSubject,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                message.subject,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ),
            const Divider(height: 1.0),
            Padding(
              padding: const EdgeInsets.only(
                left: 16.0,
                right: 16.0,
                top: 16.0,
              ),
              child: Text(
                Strings.messageMessage,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                message.message,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Reply to message
  Future<void> _replyMessage(BuildContext context) async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute<MessageResult>(
        builder: (context) => MessageEditScreen(
          subject: formatReplySubject(message),
          members: [message.remoteMember],
          message: formatReplyMessage(message),
        ),
      ),
    );
    if (result is MessageSendResult) {
      Navigator.of(context).pop(result);
    }
  }

  /// Forward message
  Future<void> _forwardMessage(BuildContext context) async {
    final members = await Navigator.push(
      context,
      MaterialPageRoute<MemberPickerModel>(
        builder: (context) => const MemberPickerScreen(),
      ),
    );
    if (members != null) {
      final result = await Navigator.push(
        context,
        MaterialPageRoute<MessageResult>(
          builder: (context) => MessageEditScreen(
            subject: formatForwardSubject(message),
            members: members.membersToSend,
            message: formatReplyMessage(message),
          ),
        ),
      );
      if (result is MessageSendResult) {
        Navigator.of(context).pop(result);
      }
    }
  }

  /// Delete message (with confirmation)
  Future<void> _deleteMessage(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (BuildContext c) {
        return AlertDialog(
          content: Text(Strings.messagesDeleteConfirmation),
          actions: <Widget>[
            TextButton(
              child: Text(Strings.actionNo.toUpperCase()),
              onPressed: () {
                Navigator.of(c).pop(false);
              },
            ),
            TextButton(
              child: Text(Strings.actionYes.toUpperCase()),
              onPressed: () {
                Navigator.of(c).pop(true);
              },
            ),
          ],
        );
      },
    );
    if (result == true) {
      Navigator.of(context).pop(MessageDeleteResult());
    }
  }
}
