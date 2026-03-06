import 'package:telnor/model/password.dart';
import 'encrypted.dart';

/// Files that are about to be shared to other users

/// Class for storing results of the first part of sharing process
class Share1Result {
  const Share1Result({required this.shareData, required this.newFileIds});

  final Map<int, List<PasswordShare>> shareData;

  final List<String> newFileIds;

  static Share1Result fromJson(Map<String, dynamic> data) => Share1Result(
    shareData: data['sharedata'].map<int, List<PasswordShare>>((
      String k,
      dynamic v,
    ) {
      return MapEntry<int, List<PasswordShare>>(
        int.parse(k),
        v.map<PasswordShare>((dynamic e) {
          return PasswordShare.fromJson(e)..shareUserId = int.parse(k);
        }).toList(),
      );
    }),
    newFileIds: List<String>.from(data['newfileids']),
  );

  Map<String, dynamic> toJson() => <String, dynamic>{
    'sharedata': shareData.map<String, List<Map<String, dynamic>>>((k, v) {
      return MapEntry(k.toString(), v.map((e) => e.toJson()).toList());
    }),
    'newfileids': newFileIds,
  };
}

class TeamFileShare {
  TeamFileShare({
    required this.index,
    required this.fileId,
    required this.teamId,
    required this.keyId,
    required this.shareKey,
  });

  final int index;
  final String fileId;
  final String teamId;
  final int keyId;
  final String shareKey;

  Encrypted? data;
}

class UserFileShare {
  UserFileShare({
    required this.index,
    required this.sourceId,
    required this.fileId,
    required this.toId,
    required this.keyId,
    required this.shareKey,
  });

  final int index;
  final String sourceId;
  final String fileId;
  final String toId;
  final String? keyId;
  final String shareKey;

  Encrypted? data;
}

/// Class for storing results of the second part of sharing process
class Share2ResultV2 {
  Share2ResultV2({
    required this.teamDataString,
    required this.teamHash,
    required this.userDataString,
    required this.userHash,
  });

  String teamDataString;
  String teamHash;
  String userDataString;
  String userHash;
  List<UserFileShare>? newUserFiles;
  List<TeamFileShare>? newTeamFiles;
  Map<int, List<String>>? noDelUserSource;
  Map<int, List<String>>? noDelTeamSource;

  static Share2ResultV2 fromJson(Map<String, dynamic> data) {
    final result = Share2ResultV2(
      teamDataString: data['teamdatastring'] ?? '',
      teamHash: data['teamhash'] ?? '',
      userDataString: data['userdatastring'],
      userHash: data['userhash'],
    );
    if (data['user'] != null) {
      result.newUserFiles = List<UserFileShare>.from(
        data['user']['newfiles']
            .map<List<UserFileShare>>((dynamic e) {
              final result = <UserFileShare>[];
              for (int i = 0; i < e['fileids'].length; i++) {
                result.add(
                  UserFileShare(
                    index: e['index'],
                    sourceId: e['sourceid'],
                    fileId: e['fileids'][i],
                    toId: e['toids'][i],
                    keyId: null,
                    shareKey: e['sharekeys'][i],
                  ),
                );
              }
              return result;
            })
            .toList()
            .expand((List<UserFileShare> e) => e),
      );

      result.noDelUserSource = data['user']['nodelsource']
          .map<int, List<String>>((String k, dynamic v) {
            return MapEntry<int, List<String>>(
              int.parse(k),
              v.map<String>((dynamic e) => e.toString()).toList(),
            );
          });
    }
    if (data['team'] != null) {
      result.newTeamFiles = List<TeamFileShare>.from(
        data['team']['newfiles']
            .map<List<TeamFileShare>>((dynamic e) {
              final result = <TeamFileShare>[];
              for (int i = 0; i < e['fileids'].length; i++) {
                result.add(
                  TeamFileShare(
                    index: e['index'],
                    fileId: e['fileids'][i],
                    teamId: e['teamids'][i],
                    keyId: e['keyids'][i],
                    shareKey: e['sharekeys'][i],
                  ),
                );
              }
              return result;
            })
            .toList()
            .expand((List<TeamFileShare> e) => e),
      );

      result.noDelTeamSource = data['team']['nodelsource']
          .map<int, List<String>>((String k, dynamic v) {
            return MapEntry<int, List<String>>(
              int.parse(k),
              v.map<String>((dynamic e) => e.toString()).toList(),
            );
          });
    }
    return result;
  }
}
