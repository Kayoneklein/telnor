import 'dart:convert';
import 'dart:developer' as dev;
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'package:telnor/model/configuration.dart';
import 'package:telnor/model/encrypted.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/model/user.dart';
import 'package:telnor/util/encrypt.dart';
import 'package:telnor/web/web.dart';

class LocalDBTable {
  static const String user = 'User';
  static const String password = 'Password';
  static const String group = 'Groups';
  static const String messages = 'Message';
  static const String team = 'Team';
  static const String teamMembers = 'TeamMembers';
  static const String teamShare = 'TeamShares';
  static const String remoteConfig = 'RemoteConfiguration';
  static const String encrypted = 'Encrypted';
  static const String passwordFavicons = 'Favicons';
}

class LocalDBService {
  LocalDBService._() {
    _initDB();
  }

  static LocalDBService get db => LocalDBService._();

  Database? _localDb;

  Future<void> _openDB() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'telnor.db');

    _localDb = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        ///CREATE USER TABLE
        await db.execute('''CREATE TABLE
          ${LocalDBTable.user} (userid INTEGER PRIMARY KEY, data TEXT )''');

        ///CREATE PASSWORD TABLE
        await db.execute(
          '''CREATE TABLE ${LocalDBTable.password}(id TEXT PRIMARY KEY, data TEXT )''',
        );

        ///CREATE A DB FOR GROUPS
        await db.execute(
          '''CREATE TABLE ${LocalDBTable.group} (id TEXT PRIMARY KEY, data TEXT)''',
        );

        ///CREATE A DB FOR TEAMS
        await db.execute(
          '''CREATE TABLE ${LocalDBTable.team} (id INTEGER PRIMARY KEY, data INTEGER)''',
        );

        ///CREATE A DB FOR TEAM MEMBERS
        await db.execute(
          '''CREATE TABLE ${LocalDBTable.teamMembers} (id INTEGER PRIMARY KEY,
            userid INTEGER, teamid INTEGER, data TEXT)''',
        );

        ///CREATE A DB FOR RemoteConfiguration
        await db.execute(
          '''CREATE TABLE ${LocalDBTable.remoteConfig} (id INTEGER PRIMARY KEY, data TEXT)''',
        );

        ///CREATE A DB FOR Encrypted
        await db.execute(
          '''CREATE TABLE ${LocalDBTable.encrypted} (id INTEGER PRIMARY KEY, name TEXT, data TEXT)''',
        );

        ///CREATE A DB FOR Team share
        await db.execute(
          '''CREATE TABLE ${LocalDBTable.teamShare} (id INTEGER PRIMARY KEY,
             keyid INTEGER, teamid INTEGER, data TEXT)''',
        );

        ///CREATE A DB FOR Password favicons. This is a list of strings for password icons
        await db.execute('''CREATE TABLE
        ${LocalDBTable.passwordFavicons}(id INTEGER PRIMARY KEY, data TEXT)''');
      },
    );
  }

  Future<void> _initDB() async {
    if (_localDb == null) {
      await _openDB();
    }
  }

  Future<int?> addUser(User user) async {
    try {
      await _initDB();

      final String encoded = jsonEncode(user.toJson());
      final String data = Encryption().encrypt(encoded);

      final add = await _localDb?.rawInsert(
        '''
          INSERT INTO ${LocalDBTable.user} (userid,  data) VALUES(?, ?)''',
        [user.id, data],
      );
      return add;
    } catch (err) {
      dev.log('error from addUser() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> addPassword(Password pass) async {
    try {
      await _initDB();
      final password = await _localDb?.rawQuery(
        '''SELECT * FROM ${LocalDBTable.password} WHERE id=?''',
        [pass.id],
      );
      int? passId;
      if (password?.isNotEmpty == true) {
        passId = await _updatePassword(pass);
      } else {
        passId = await _createPassword(pass);
      }

      return passId;
    } catch (err) {
      dev.log('Error from addPassword() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _createPassword(Password pass) async {
    try {
      await _initDB();
      final data = jsonEncode(pass.toJson());
      final dataEncrypt = Encryption().encrypt(data);

      final passId = await _localDb?.rawInsert(
        '''INSERT INTO ${LocalDBTable.password}(id, data) VALUES(?, ?)''',
        [pass.id, dataEncrypt],
      );

      return passId;
    } catch (err) {
      dev.log('Error from addPassword() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _updatePassword(Password pass) async {
    try {
      await _initDB();

      final data = jsonEncode(pass.toJson());
      final dataEncrypt = Encryption().encrypt(data);

      final updatePass = await _localDb?.rawUpdate(
        '''UPDATE ${LocalDBTable.password} SET data=? WHERE id=?''',
        [dataEncrypt, pass.id],
      );

      return updatePass;
    } catch (err) {
      dev.log('Error from addPassword() in LocalDBService: $err');
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getData({required String tbl}) async {
    try {
      await _initDB();
      final List<Map<String, dynamic>> allData = [];

      final query = await _localDb?.rawQuery('''SELECT data FROM $tbl''');

      if (query?.isNotEmpty == true) {
        for (var qr in query!) {
          final String data = qr['data'] as String;
          final decrypted = Encryption().decrypt(data);
          final Map<String, dynamic> jsonData = jsonDecode(decrypted);
          allData.add(jsonData);
        }
      }

      return allData;
    } catch (e) {
      dev.log('Error from getData() in  LocalDBService: $e');
      return [];
    }
  }

  Future<int?> addGroup(Group grp) async {
    try {
      await _initDB();
      final group = await _localDb?.rawQuery(
        '''SELECT * FROM ${LocalDBTable.group} WHERE id=?''',
        [grp.id],
      );
      int? gp;
      if (group?.isNotEmpty == true) {
        gp = await _updateGroup(grp);
      } else {
        gp = await _addGroup(grp);
      }

      return gp;
    } catch (err) {
      dev.log('Error from addGroup() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _addGroup(Group grp) async {
    try {
      await _initDB();

      final String data = jsonEncode(grp.toJson());
      final String encrypted = Encryption().encrypt(data);

      final group = await _localDb?.rawInsert(
        '''INSERT INTO ${LocalDBTable.group} 
      (id, data) VALUES(?, ?)''',
        [grp.id, encrypted],
      );

      return group;
    } catch (err) {
      dev.log('Error from addGroup() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _updateGroup(Group grp) async {
    try {
      await _initDB();
      final String data = jsonEncode(grp.toJson());
      final String encrypted = Encryption().encrypt(data);
      final group = await _localDb?.rawUpdate(
        '''UPDATE ${LocalDBTable.group} SET data=? WHERE id=?''',
        [encrypted, grp.id],
      );

      return group;
    } catch (err) {
      dev.log('Error from _updateGroup() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> addTeam(Team team) async {
    try {
      await _initDB();
      final tms = await _localDb?.rawQuery(
        '''SELECT * FROM ${LocalDBTable.team}
      WHERE id=?''',
        [team.id],
      );

      int? tm;
      if (tms?.isNotEmpty == true) {
        tm = await _updateTeam(team);
      } else {
        tm = await _addTeam(team);
      }

      return tm;
    } catch (err) {
      dev.log('Error from addTeam() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _addTeam(Team team) async {
    try {
      await _initDB();
      final String data = jsonEncode(team.toJson());
      final String encrypted = Encryption().encrypt(data);

      final tm = await _localDb?.rawInsert(
        '''INSERT INTO ${LocalDBTable.team} (
      id, data) VALUES (?, ?)''',
        [team.id, encrypted],
      );

      return tm;
    } catch (err) {
      dev.log('Error from _addTeam() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _updateTeam(Team team) async {
    try {
      await _initDB();
      final String data = jsonEncode(team.toJson());
      final String encrypted = Encryption().encrypt(data);

      final tm = await _localDb?.rawUpdate(
        '''UPDATE ${LocalDBTable.team} SET
       data=? WHERE id=?''',
        [encrypted, team.id],
      );

      return tm;
    } catch (err) {
      dev.log('Error from _updateTeam() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> addTeamMembers(TeamMember member) async {
    try {
      await _initDB();
      final mem = await _localDb?.rawQuery(
        '''SELECT * FROM ${LocalDBTable.teamMembers}
          WHERE userid=? AND teamid=?''',
        [member.userId, member.teamId],
      );
      int? mems;
      if (mem?.isNotEmpty == true) {
        mems = await _updateTeamMembers(member);
      } else {
        mems = await _addTeamMembers(member);
      }
      return mems;
    } catch (err) {
      dev.log('Error from addTeamMembers() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _addTeamMembers(TeamMember member) async {
    try {
      await _initDB();

      final String data = jsonEncode(member.toJson());
      final String encrypted = Encryption().encrypt(data);

      final mem = await _localDb?.rawInsert(
        '''INSERT INTO ${LocalDBTable.teamMembers}(userid, teamid, data) VALUES(?, ?, ?)''',
        [member.userId, member.teamId, encrypted],
      );

      return mem;
    } catch (err) {
      dev.log('Error from _addTeamMembers() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _updateTeamMembers(TeamMember member) async {
    try {
      await _initDB();
      final String data = jsonEncode(member.toJson());
      final String encrypted = Encryption().encrypt(data);
      final mem = await _localDb?.rawUpdate(
        '''UPDATE ${LocalDBTable.teamMembers} SET
     userid=?, teamid=?, data=? WHERE teamid=? AND userId=?''',
        [
          member.userId,
          member.teamId,
          encrypted,

          ///conditions
          member.teamId, member.userId,
        ],
      );

      return mem;
    } catch (err) {
      dev.log('Error from _updateTeamMembers() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> addRemoteConfig(RemoteConfiguration config) async {
    try {
      final String data = jsonEncode(config.toJson());
      final String encrypted = Encryption().encrypt(data);

      final conf = await _localDb?.rawInsert(
        '''INSERT INTO ${LocalDBTable.remoteConfig}
      (data) VALUES(?)''',
        [encrypted],
      );

      return conf;
    } catch (err) {
      dev.log('Error from addRemoteConfig() in LocalDBService: $err');

      return null;
    }
  }

  Future<int?> addEncrypted(Encrypted encrypt, DataName name) async {
    try {
      await _initDB();
      final query = await _localDb?.rawQuery(
        '''SELECT * FROM 
      ${LocalDBTable.encrypted} WHERE name=?''',
        [name.name],
      );
      if (query?.isNotEmpty == true) {
        return _updateEncrypted(encrypt, name);
      } else {
        return _addEncrypted(encrypt, name);
      }
    } catch (err) {
      dev.log('Error from addEncrypted() in LocalDBService:$err');
      return null;
    }
  }

  Future<int?> _addEncrypted(Encrypted encrypt, DataName name) async {
    try {
      await _initDB();
      final String data = jsonEncode(encrypt.toJson());
      final String encrypted = Encryption().encrypt(data);

      final enc = await _localDb?.rawInsert(
        '''INSERT INTO 
      ${LocalDBTable.encrypted} (name, data) VALUES(?, ?)''',
        [name.name, encrypted],
      );
      return enc;
    } catch (err) {
      dev.log('Error from _addEncrypted() in LocalDBService:$err');
      return null;
    }
  }

  Future<int?> _updateEncrypted(Encrypted encrypt, DataName name) async {
    try {
      await _initDB();
      final String data = jsonEncode(encrypt.toJson());
      final String encrypted = Encryption().encrypt(data);

      final enc = await _localDb?.rawUpdate(
        '''UPDATE
      ${LocalDBTable.encrypted} SET name=?, data=? WHERE name=?''',
        [name.name, encrypted, name.name],
      );
      return enc;
    } catch (err) {
      dev.log('Error from _updateEncrypted() in LocalDBService:$err');
      return null;
    }
  }

  Future<Map<String, dynamic>?> getEncrypted(DataName name) async {
    try {
      await _initDB();
      final enc = await _localDb?.rawQuery(
        '''SELECT data FROM ${LocalDBTable.encrypted} WHERE name=?''',
        [name.name],
      );

      if (enc?.isNotEmpty == true) {
        final encrypt = enc?.first['data'] as String;
        final decrypt = Encryption().decrypt(encrypt);
        final e = jsonDecode(decrypt);

        return e;
      }
      return null;
    } catch (err) {
      dev.log('Error from getEncrypted() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> addTeamShare(TeamShare share) async {
    try {
      await _initDB();
      final query = await _localDb?.rawQuery(
        '''SELECT * FROM 
      ${LocalDBTable.teamShare} WHERE keyid=? AND teamid=?''',
        [share.keyId, share.teamId],
      );

      if (query?.isNotEmpty == true) {
        return _updateTeamShare(share);
      } else {
        return _addTeamShare(share);
      }
    } catch (err) {
      dev.log('Error from addTeamShare() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _addTeamShare(TeamShare share) async {
    try {
      await _initDB();
      final String data = jsonEncode(share.toJson());
      final String encrypted = Encryption().encrypt(data);
      final tm = await _localDb?.rawInsert(
        '''INSERT INTO ${LocalDBTable.teamShare} (data, keyid, teamid) VALUES (?, ?, ? )''',
        [encrypted, share.keyId, share.teamId],
      );

      return tm;
    } catch (err) {
      dev.log('Error from _addTeamShare() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> _updateTeamShare(TeamShare share) async {
    try {
      await _initDB();
      final String data = jsonEncode(share.toJson());
      final String encrypted = Encryption().encrypt(data);

      final tm = await _localDb?.rawUpdate(
        '''UPDATE ${LocalDBTable.teamShare} SET
      data=?, keyid=?, teamid=? WHERE teamid=? AND keyid=?''',
        [
          encrypted,
          share.keyId,
          share.teamId,

          ///conditions
          share.teamId,
          share.keyId,
        ],
      );

      return tm;
    } catch (err) {
      dev.log('Error from _updateTeamShare() in LocalDBService: $err');
      return null;
    }
  }

  Future<int?> addFavicons(List<String> icons) async {
    try {
      await _initDB();
      int? add = 0;
      for (final icon in icons) {
        final count = await _localDb?.rawQuery(
          '''SELECT data FROM ${LocalDBTable.passwordFavicons} 
            WHERE data=?''',
          [icon],
        );

        if (count?.isEmpty == true) {
          add = await _localDb?.rawInsert(
            '''
          INSERT INTO ${LocalDBTable.passwordFavicons}(data) VALUES(?)''',
            [icon],
          );
        }
      }

      return add;
    } catch (err) {
      dev.log('error from addFavicons() in LocalDBService: $err');
      return null;
    }
  }

  Future<List<String>> getPasswordFavicons() async {
    try {
      await _initDB();
      final icons = await _localDb?.rawQuery(
        '''SELECT data FROM ${LocalDBTable.passwordFavicons}''',
      );

      if (icons?.isNotEmpty == true) {
        final list = icons!.map((ic) => ic['data'] as String).toList();
        return list;
      }

      return [];
    } catch (err) {
      dev.log('Error from getPasswordFavicons() in LocalDBService: $err');
      return [];
    }
  }

  Future<int?> deleteDBTaleData(String table) async {
    await _initDB();
    final del = await _localDb?.rawDelete('DELETE FROM $table');
    return del;
  }

  Future<void> closeDb() async {
    await _initDB();
    await _localDb?.close();
  }

  Future viewTables() async {
    await _initDB();
    final tables = await _localDb?.rawQuery(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;",
    );

    print(tables);
  }

  Future<void> deleteAppDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = '$dbPath/pcrypt.db';

    await deleteDatabase(path);
  }
}
