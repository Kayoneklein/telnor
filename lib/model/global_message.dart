import 'package:intl/intl.dart';

/// Class to store Global user notifications
class GlobalMessage {
  const GlobalMessage({
    required this.id,
    required this.topic,
    required this.content,
    required this.isSticky,
    required this.isDraft,
    required this.createdAt,
  });

  final int id;
  final String topic;
  final String content;
  final bool isSticky;
  final bool isDraft;
  final DateTime createdAt;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'id': id,
    'topic': topic,
    'content': content,
    'created': DateFormat('yyyy-MM-dd HH:mm:ss').format(createdAt),
    'sticky': isSticky ? 1 : 0,
    'draft': isDraft ? 1 : 0,
  };

  static GlobalMessage fromJson(Map<String, dynamic> data) => GlobalMessage(
    id: _tryParseInt(data['id']),
    topic: data['topic'],
    content: data['content'],
    createdAt: DateFormat('yyyy-MM-dd HH:mm:ss').parse(data['created']),
    isSticky: _tryParseInt(data['sticky']) == 1,
    isDraft: _tryParseInt(data['draft']) > 0,
  );


  /// Attempt to parse integer value
  static int _tryParseInt(dynamic data) {
    try {
      if (data is int) {
        return data;
      }
      if (data is String) {
        return int.parse(data);
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
}
