import 'dart:typed_data';

import 'package:intl/intl.dart';
import 'package:telnor/model/pcrypt_key.dart';

import 'encrypted.dart';

const String teamDateFormat = 'yyyy-MM-dd HH:mm:ss';

/// Team which user can be a part of
class Team {
  const Team({
    required this.id,
    required this.isAdmin,
    required this.isTeamCreator,
    required this.isApproved,
    required this.username,
    required this.department,
    required this.name,
    required this.contact,
    required this.email,
    required this.options,
  });

  final int id;

  final bool isAdmin;
  final bool isTeamCreator;
  final bool isApproved;
  final String? username;
  final String? department;

  final String name;
  final String contact;
  final String email;
  final dynamic options; //Not used

  Map<String, dynamic> toJson() => <String, dynamic>{
    'id': id,
    'admin': isTeamCreator
        ? 2
        : isAdmin
        ? 1
        : 0,
    'approved': isApproved ? 1 : 0,
    'username': username,
    'department': department,
    'fields': <String, dynamic>{
      'name': name,
      'contact': contact,
      'email': email,
      'options': options,
    },
  };

  static Team fromJson(int id, Map<String, dynamic> data) {
    return Team(
      id: id,
      isAdmin: data['admin'] > 0,
      isTeamCreator: data['admin'] == 2,
      isApproved: data['approved'] == 1,
      username: data['username'],
      department: data['department'],
      name: data['fields']['name'] ?? '',
      contact: data['fields']['contact'],
      email: data['fields']['email'] ?? '',
      options: data['fields']['options'],
    );
  }
}

/// Short version of the Team, containing only id and name
class TeamShort {
  const TeamShort({required this.id, required this.name});

  final int id;
  final String name;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TeamShort && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

//----------------------------------------------------------------------------------------------------------------------

/// Member of the team
class TeamMember {
  TeamMember({
    required this.userId,
    required this.name,
    required this.department,
    required this.email,
    required this.isAdmin,
    required this.isTeamCreator,
    required this.isApproved,
    required this.userOptions,
    required this.userHidePassword,
    required this.userNoShare,
    required this.teamId,
    required this.teamName,
    required this.teamHidePassword,
    required this.teamOnlyAdminShare,
    required this.teamKeysFromId,
    required this.teamKeysData,
    required this.publicKey,
    required this.createdAt,
  });

  TeamMember.email({required String email, required Team team})
    : this(
        userId: -1,
        name: '',
        department: '',
        email: email,
        isAdmin: false,
        isTeamCreator: false,
        isApproved: false,
        userOptions: 0,
        userHidePassword: false,
        userNoShare: false,
        teamId: team.id,
        teamName: team.name,
        teamHidePassword: false,
        teamOnlyAdminShare: false,
        teamKeysFromId: -1,
        teamKeysData: null,
        publicKey: null,
        createdAt: DateTime.now(),
      );

  TeamMember.entireTeam({required Team team})
    : this(
        userId: 0,
        name: '',
        department: '',
        email: '',
        isAdmin: false,
        isTeamCreator: false,
        isApproved: false,
        userOptions: 0,
        userHidePassword: false,
        userNoShare: false,
        teamId: team.id,
        teamName: team.name,
        teamHidePassword: false,
        teamOnlyAdminShare: false,
        teamKeysFromId: -1,
        teamKeysData: null,
        publicKey: null,
        createdAt: DateTime.now(),
      );

  String get nonEmptyName => userId == 0
      ? teamName
      : name.isNotEmpty
      ? name
      : email;

  int get _teamKeysFromId =>
      teamKeysFromId is int ? teamKeysFromId : int.tryParse(teamKeysFromId);

  final int userId;
  final String name;
  final String department;
  final String email;
  final bool isAdmin;
  final bool isTeamCreator;
  final bool isApproved;
  final dynamic userOptions; //Not used
  final bool userHidePassword;
  final bool userNoShare;

  final int teamId;
  final String teamName;
  final bool teamHidePassword;
  final bool teamOnlyAdminShare;

  final dynamic teamKeysFromId;
  final Encrypted? teamKeysData;

  final PCryptKey? publicKey;
  final DateTime createdAt;

  Uint8List? avatar;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'userid': userId,
    'name': name,
    'department': department,
    'email': email,
    'admin': isTeamCreator
        ? 2
        : isAdmin
        ? 1
        : 0,
    'approved': isApproved ? 1 : 0,
    'useroptions': userOptions,
    'userhidepass': userHidePassword ? 1 : 0,
    'usernoshare': userNoShare ? 1 : 0,
    'teamid': teamId,
    'teamname': teamName,
    'teamhidepass': teamHidePassword ? 1 : 0,
    'teamonlyadminshare': teamOnlyAdminShare ? 1 : 0,
    'teamkeysfromid': _teamKeysFromId > -1 ? teamKeysFromId.toString() : null,
    'teamkeysdata': teamKeysData?.toJson(),
    'publickey': publicKey?.toJson(),
    'created': DateFormat(teamDateFormat).format(createdAt),
  };

  static TeamMember fromJson(Map<String, dynamic> data) => TeamMember(
    userId: data['userid'] ?? -1,
    name: data['name'] ?? '',
    department: data['department'] ?? '',
    email: data['email'] ?? '',
    isAdmin: data['admin'] > 0,
    isTeamCreator: data['admin'] == 2,
    isApproved: data['approved'] == 1,
    userOptions: data['useroptions'],
    userHidePassword: data['userhidepass'] == 1,
    userNoShare: data['usernoshare'] == 1,
    teamId: data['teamid'] ?? -1,
    teamName: data['teamname'],
    teamHidePassword: data['teamhidepass'] == 1,
    teamOnlyAdminShare: data['teamonlyadminshare'] == 1,
    teamKeysFromId: data['teamkeysfromid'] != null
        ? data['teamkeysfromid']
        : -1,
    teamKeysData: data['teamkeysdata'] != null
        ? Encrypted.fromJson(data['teamkeysdata'])
        : null,
    publicKey: data['publickey'] != null
        ? PCryptKey.fromJson(data['publickey'])
        : null,
    createdAt: DateFormat(teamDateFormat).parse(data['created']),
  );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TeamMember &&
          runtimeType == other.runtimeType &&
          userId == other.userId;

  @override
  int get hashCode => userId.hashCode;
}

//----------------------------------------------------------------------------------------------------------------------

/// Enumeration to define various sources of shared passwords
enum TeamShareType { team, user }

/// Data shared by other user
class TeamShare {
  const TeamShare({
    required this.type,
    required this.userId,
    required this.email,
    required this.read,
    required this.hash,
    required this.data,
    required this.keyId,
    required this.teamId,
  });

  final TeamShareType type;

  final int userId;
  final String email;
  final int read; //TODO clarify
  final String hash;
  final Encrypted data;

  final int keyId;
  final int teamId;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'type': _typeToString(type),
    'userid': userId,
    'email': email,
    'read': read,
    'hash': hash,
    'data': data.toJson(),
    'keyid': keyId > -1 ? keyId : null,
    'teamid': teamId > -1 ? teamId : null,
  };

  static TeamShare fromJson(Map<String, dynamic> data) => TeamShare(
    type: _typeFromString(data['type']),
    userId: data['userid'],
    email: data['email'],
    read: data['read'] ?? 0,
    hash: data['hash'],
    data: Encrypted.fromJson(data['data']),
    keyId: data['keyid'] ?? -1,
    teamId: data['teamid'] ?? -1,
  );

  static TeamShareType _typeFromString(String type) {
    switch (type) {
      case 'usershare':
        return TeamShareType.user;
      case 'teamshare':
      default:
        return TeamShareType.team;
    }
  }

  static String _typeToString(TeamShareType type) {
    switch (type) {
      case TeamShareType.user:
        return 'usershare';
      case TeamShareType.team:
        return 'teamshare';
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------

/// Info about binaries shared among team
class TeamBinary {
  const TeamBinary({
    required this.id,
    required this.userId,
    required this.name,
    required this.updated,
  });

  final String id;
  final int userId;

  final String name;
  final DateTime updated;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'name': name,
    'updated': DateFormat(teamDateFormat).format(updated),
  };

  static TeamBinary fromJson(
    String id,
    int userId,
    Map<String, dynamic> data,
  ) => TeamBinary(
    id: id,
    userId: userId,
    name: data['name'] ?? '',
    updated: DateFormat(teamDateFormat).parse(data['updated']),
  );
}

//----------------------------------------------------------------------------------------------------------------------

/// Pair of [Team] identifier and [Member] identifier
class TeamMemberIdPair {
  const TeamMemberIdPair({required this.teamId, required this.memberId});

  final int teamId;
  final int memberId;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TeamMemberIdPair &&
          runtimeType == other.runtimeType &&
          teamId == other.teamId &&
          memberId == other.memberId;

  @override
  int get hashCode => teamId.hashCode ^ memberId.hashCode;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'teamid': teamId,
    'teamuserid': memberId,
  };

  static TeamMemberIdPair fromJson(Map<String, dynamic> data) =>
      TeamMemberIdPair(teamId: data['teamid'], memberId: data['teamuserid']);
}
