import 'package:intl/intl.dart';
import 'package:telnor/model/encrypted.dart';
import 'package:telnor/model/team.dart';

/// Type of messages list
enum MessagesBox { inbox, outbox }

//----------------------------------------------------------------------------------------------------------------------

/// Class for encrypted messages that arrive from the server
class MessageEncrypted {
  const MessageEncrypted({
    required this.mailId,
    required this.remoteId,
    required this.data,
    required this.createdAt,
    required this.isRead,
  });

  final int mailId;
  final int remoteId;
  final Encrypted data;
  final DateTime createdAt;
  final bool isRead;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'mailid': mailId,
    'remoteid': remoteId,
    'data': data.toJson(),
    'created': DateFormat('yyyy-MM-dd HH:mm:ss').format(createdAt),
    'read': isRead ? 1 : 0,
  };

  static MessageEncrypted fromJson(Map<String, dynamic> data) =>
      MessageEncrypted(
        mailId: data['mailid'],
        remoteId: data['remoteid'],
        data: Encrypted.fromJson(data['data']),
        createdAt: DateFormat('yyyy-MM-dd HH:mm:ss').parse(data['created']),
        isRead: data['read'] == 1,
      );
}

//----------------------------------------------------------------------------------------------------------------------

///Class for already decrypted message
class Message {
  const Message({
    required this.mailId,
    required this.subject,
    required this.message,
    required this.remoteMember,
    required this.shares,
    required this.createdAt,
    required this.isRead,
  });

  final int mailId;
  final String subject;
  final String message;
  final TeamMember remoteMember;
  final Map<int, List<int>> shares;
  final DateTime createdAt;
  final bool isRead;

  static Message fromJson(
    Map<String, dynamic> data,
    MessageEncrypted original,
    Team team,
    TeamMember member,
  ) => Message(
    mailId: original.mailId,
    subject: data['sub'],
    message: data['note'],
    remoteMember: member,
    shares: _tryParseShares(data['shares']),
    createdAt: DateTime.fromMillisecondsSinceEpoch(data['cre']),
    isRead: original.isRead,
  );
}

//----------------------------------------------------------------------------------------------------------------------

/// Class for storing the message data that is about to be sent
class MessageToSend {
  MessageToSend({
    required this.subject,
    required this.message,
    required this.teamId,
    required this.shares,
    required this.createdAt,
  });

  final String subject;
  final String message;
  final int teamId;
  final Map<int, List<int>> shares;
  final DateTime createdAt;

  List<TeamMember> members = [];

  Map<String, dynamic> toJson() => <String, dynamic>{
    'sub': subject,
    'note': message,
    'teamid': teamId,
    'shares': shares.map<String, dynamic>(
      (k, v) => MapEntry<String, dynamic>(k.toString(), v),
    ),
    'cre': createdAt.millisecondsSinceEpoch,
  };

  static MessageToSend fromJson(Map<String, dynamic> data) => MessageToSend(
    subject: data['sub'],
    message: data['note'],
    teamId: data['teamid'],
    shares: _tryParseShares(data['shares']),
    createdAt: DateTime.fromMillisecondsSinceEpoch(data['cre']),
  );
}

class MessageInfo {
  MessageInfo({required this.subject, required this.message});

  final String subject;
  final String message;
  List<int> userIds = [];
  List<int> teamIds = [];
}
//----------------------------------------------------------------------------------------------------------------------

/// Try to parse password shares
Map<int, List<int>> _tryParseShares(dynamic data) {
  try {
    if (data != null && data is Map<String, dynamic>) {
      return Map<int, List<int>>.fromIterable(
        data.entries.where(
          (e) => int.tryParse(e.key) != null && e.value is List,
        ),
        key: (dynamic e) => int.parse(e.key),
        value: (dynamic e) => List<int>.from(e.value),
      );
    } else {
      return {};
    }
  } catch (error) {
    return {};
  }
}
