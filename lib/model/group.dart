import 'dart:math';

/// Specific password group (tag)
class Group {
  const Group({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String name;
  final DateTime createdAt;
  final DateTime updatedAt;

  bool get isEmpty => id == '';

  static Group fromJson(Map<String, dynamic> data) => Group(
        id: data['id']?.toString() ?? randomId,
        name: data['name'],
        createdAt: _tryParseDateTime(data['cre']),
        updatedAt: _tryParseDateTime(data['upd']),
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'name': name,
        'cre': createdAt.millisecondsSinceEpoch,
        'upd': updatedAt.millisecondsSinceEpoch,
      };

  /// Try to parse [createdAt] and [updatedAt] values
  static DateTime _tryParseDateTime(dynamic data) {
    if (data is int) {
      return DateTime.fromMillisecondsSinceEpoch(data);
    } else {
      return DateTime.now();
    }
  }

  /// Generate random identifier
  static String get randomId {
    const length = 22;
    const vocabulary = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    final rand = Random();
    final buffer = StringBuffer();
    for (int i = 0; i < length; i++) {
      buffer.write(vocabulary[rand.nextInt(vocabulary.length)]);
    }
    return buffer.toString();
  }
}
