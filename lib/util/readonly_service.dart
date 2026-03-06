import 'package:telnor/model/configuration.dart';
import 'package:telnor/model/encrypted.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/model/user.dart';
import 'package:telnor/web/local_db_service.dart';
import 'package:telnor/web/web.dart';

class ReadOnlyService {
  ReadOnlyService();

  final LocalDBService _db = LocalDBService.db;

  Future<int?> addUser(User user) async {
    await _db.deleteDBTaleData(LocalDBTable.user);
    final addCount = await _db.addUser(user);
    return addCount;
  }

  Future<User?> getUser() async {
    final user = await _db.getData(tbl: LocalDBTable.user);

    if (user.isNotEmpty) {
      return User.fromJson(user[0]);
    }
    return null;
  }

  Future<int?> addPasswords(List<Password> passwords) async {
    print(passwords.map((p) => p.toJson()));
    int? p;

    for (var pwd in passwords) {
      await _db.addPassword(pwd);
    }

    return p;
  }

  Future<List<Password>> getPasswords() async {
    try {
      final passwords = await _db.getData(tbl: LocalDBTable.password);
      return passwords
          .map((pass) => Password.fromJson(pass, canRemove: false))
          .toList();
    } catch (err) {
      print('err');
      print(err);
      return [];
    }
  }

  Future<int?> addGroups(List<Group> groups) async {
    int? grp = 0;

    for (var group in groups) {
      grp = await _db.addGroup(group);
    }

    return grp;
  }

  Future<List<Group>> getGroups() async {
    final groups = await _db.getData(tbl: LocalDBTable.group);
    return groups.map((grp) => Group.fromJson(grp)).toList();
  }

  Future<bool> addTeams(List<Team> teams) async {
    for (final Team tm in teams) {
      await _db.addTeam(tm);
    }
    return true;
  }

  Future<List<Team>> getTeams() async {
    final teams = await _db.getData(tbl: LocalDBTable.team);

    final tm = teams.map((t) {
      return Team.fromJson(t['id'], t);
    }).toList();

    return tm;
  }

  Future<int?> addTeamMember(List<TeamMember> members) async {
    int? mem;
    for (final member in members) {
      mem = await _db.addTeamMembers(member);
    }

    return mem;
  }

  Future<List<TeamMember>> getTeamMembers() async {
    final members = await _db.getData(tbl: LocalDBTable.teamMembers);

    return members.map((tm) {
      return TeamMember.fromJson(tm);
    }).toList();
  }

  Future<int?> addRemoteConfig(RemoteConfiguration config) async {
    await _db.deleteDBTaleData(LocalDBTable.remoteConfig);
    final conf = await _db.addRemoteConfig(config);
    return conf;
  }

  Future<RemoteConfiguration?> getRemoteConfig() async {
    final conf = await _db.getData(tbl: LocalDBTable.remoteConfig);
    if (conf.isNotEmpty) {
      return RemoteConfiguration.fromJson(conf[0]);
    }
    return null;
  }

  Future<int?> addEncrypted(Encrypted enc, DataName name) async {
    final en = await _db.addEncrypted(enc, name);
    return en;
  }

  Future<Encrypted?> getEncrypted(DataName name) async {
    final enc = await _db.getEncrypted(name);
    if (enc != null) {
      return Encrypted.fromJson(enc);
    }
    return null;
  }

  Future addTeamShare(List<TeamShare> shares) async {
    for (var share in shares) {
      await _db.addTeamShare(share);
    }
  }

  Future<List<TeamShare>> getTeamShare() async {
    final shares = await _db.getData(tbl: LocalDBTable.teamShare);

    return shares.map((s) {
      return TeamShare.fromJson(s);
    }).toList();
  }

  Future addFavicon(List<String> icons) async {
    await _db.addFavicons(icons);
  }

  Future<List<String>> getFavicons() async {
    final icons = await _db.getPasswordFavicons();

    return icons;
  }

  Future<void> closeDB() async {
    await _db.deleteDBTaleData(LocalDBTable.user);
    await _db.deleteDBTaleData(LocalDBTable.password);
    await _db.closeDb();
  }
}
