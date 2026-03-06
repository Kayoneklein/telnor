import 'dart:convert';
import 'dart:typed_data';

/// Defines currently logged in user
class User {
  const User({
    required this.id,
    required this.name,
    required this.department,
    required this.email,
    required this.avatar,
    required this.isPremium,
    required this.isPremiumTrial,
    required this.isEmailVerified,
  });

  final int id;
  final String name;
  final String email;
  final String department;
  final Uint8List avatar;
  final bool isPremium;
  final bool isPremiumTrial;
  final bool isEmailVerified;

  User copyWith({
    int? id,
    String? name,
    String? email,
    String? department,
    Uint8List? avatar,
    bool? isPremium,
    bool? isPremiumTrial,
    bool? isEmailVerified,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      department: department ?? this.department,
      avatar: avatar ?? this.avatar,
      isPremium: isPremium ?? this.isPremium,
      isPremiumTrial: isPremiumTrial ?? this.isPremiumTrial,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
    );
  }

  static User fromJson(Map<String, dynamic> data) {
    return User(
      id: data['userid'],
      email: data['email'],
      name: data['name'] ?? '',
      department: data['department'] ?? '',
      avatar:
          data['avatar'].isEmpty ? Uint8List(0) : base64Decode(data['avatar']),
      isPremium: _tryParseBool(data['premium']),
      isPremiumTrial: _tryParseBool(data['trialpremium']),
      isEmailVerified: _tryParseBool(data['emailconfirm']),
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'userid': id,
        'email': email,
        'name': name,
        'department': department,
        'avatar': avatar.isEmpty ? '' : base64Encode(avatar),
        'premium': isPremium ? 1 : 0,
        'trialpremium': isPremiumTrial ? 1 : 0,
        'emailconfirm': isEmailVerified ? 1 : 0,
      };

  /// Try to parse boolean field
  static bool _tryParseBool(dynamic data) {
    try {
      if (data is int) {
        return data > 0;
      }
      if (data is String) {
        return data == '1' || data == 'true';
      }
      if (data is bool) {
        return data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

///Stores number of user updated data
class UserUpdates {
  const UserUpdates({
    required this.newShares,
    required this.newMails,
    required this.teamUpdates,
    required this.deletedShares,
  });

  final int newShares;
  final int newMails;
  final int teamUpdates;
  final int deletedShares;

  static UserUpdates fromJson(Map<String, dynamic> data) => UserUpdates(
        newShares: data['shares'],
        newMails: data['mails'],
        teamUpdates: data['teamupdate'],
        deletedShares: data['sharesdel'],
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'shares': newShares,
        'mails': newMails,
        'teamupdate': teamUpdates,
        'sharesdel': deletedShares,
      };
}
