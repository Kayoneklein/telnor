import 'dart:convert';
import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import 'package:telnor/model/encrypted.dart';
import 'package:telnor/model/login.dart';
import 'package:telnor/model/login_result.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/pcrypt_key.dart';
import 'package:telnor/model/share_result.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/util/shared_password_model.dart';
import 'dart:developer' as dev;

/// Single instance of hidden WebView which processes JavaScript requests
/// Initializes once per application run and may be called from different places.
class JavaScripts {
  JavaScripts._();

  static final JavaScripts get = JavaScripts._();
  final _webView = FlutterWebviewPlugin();

  //final _webView;

  //--------------------------------------------------------------------------------------------------------------------

  /// Launch JavaScript and return evaluation result
  Future<String> _evaluate(String request) async {
    try {
      final returnString = await _webView.evalJavascript(request) ?? '';
      return returnString;
    } catch (e) {
      throw Exception(e);
    }
  }

  /// Load necessary scripts and prepare to listen for commands
  Future<void> initialize() async {
    _webView.close();
    await _webView.launch(
      'about:blank',
      hidden: true,
      clearCache: true,
      withJavascript: true,
      debuggingEnabled: true,
      javascriptChannels: {
        JavascriptChannel(
          name: 'Print',
          onMessageReceived: (JavascriptMessage message) {
            dev.log(message.message);
          },
        ),
      },
    );
    (await loadScriptFiles()).forEach(_webView.evalJavascript);
  }

  ///Return list of JavaScript source files needed
  Future<List<String>> loadScriptFiles() async {
    return [
      await rootBundle.loadString('js/lib/other/prototypes.js'),
      await rootBundle.loadString('js/lib/srp6a/thinbus-srp-config.js'),
      await rootBundle.loadString(
        'js/lib/srp6a/thinbus-srp6a-sha256-versioned.js',
      ),
      await rootBundle.loadString('js/lib/elliptic.min.js'),
      await rootBundle.loadString('js/lib/forge.min.js'),
      await rootBundle.loadString('js/lib/pcrypt.config.js'),
      await rootBundle.loadString('js/lib/pcrypt.js'),
      await rootBundle.loadString('js/_.js'),
    ];
  }

  /// Helper method for unknown type decoding (varies depending on platform)
  dynamic _smartDecode(dynamic json) {
    if (Platform.isAndroid) {
      final dynamic realJson = jsonDecode(json);
      if (realJson is String) {
        if (realJson.startsWith('{')) {
          return jsonDecode(realJson);
        }
      }
      return realJson;
    } else {
      if (json is String) {
        if (json.startsWith('{')) {
          return jsonDecode(json);
        }
      }
      return json;
    }
  }

  /// Transforms unicode characters into \uXXXX sequences
  String _escapeUnicodeCharacters(String data) {
    final result = StringBuffer();
    for (var codeUnit in data.codeUnits) {
      if (codeUnit > 255) {
        result.write('\\u');
        result.write(codeUnit.toRadixString(16).padLeft(4, '0'));
      } else {
        result.writeCharCode(codeUnit);
      }
    }
    return result.toString();
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// First step in login process (part 1)
  ///
  /// Returns AES and SRP keys to use for encryption
  Future<LoginKeys> loginStep1Part1(Login1Result data, String password) async {
    return LoginKeys.fromJson(
      _smartDecode(
        jsonDecode(
          await _evaluate(
            'login1func_1(${jsonEncode(data.toJson())}, ${jsonEncode(password)});',
          ),
        ),
      ),
    );
  }

  /// First step in login  process (part 2)
  ///
  /// Returns A and M1 credentials to pass further
  Future<LoginCredentials> loginStep1Part2(
    Login1Result data,
    LoginKeys keys,
  ) async {
    return LoginCredentials.fromJson(
      _smartDecode(
        jsonDecode(
          await _evaluate(
            'login1func_2(${jsonEncode(data.toJson())}, ${jsonEncode(keys.toJson())});',
          ),
        ),
      ),
    );
  }

  /// Second step in login process
  ///
  /// Returns session key
  Future<String> loginStep2(Login2Result data) async {
    return _smartDecode(
      await _evaluate('login2func(${jsonEncode(data.toJson())});'),
    );
  }

  /// Create new account
  ///
  /// Returns map with various data (keys, salts etc.) to pass further
  Future<AccountData> createAccount(String email, String password) async {
    final Map<String, dynamic> result = _smartDecode(
      jsonDecode(
        await _evaluate(
          'CreateAccount(${jsonEncode(email)}, ${jsonEncode(password)});',
        ),
      ),
    );
    result['keypublic'] = jsonDecode(result['keypublic']);
    result['keyprivate'] = jsonDecode(result['keyprivate']);
    return AccountData.fromJson(result);
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Decode encrypted generic data
  Future<dynamic> decodeData(Encrypted data, String aes) async {
    final first = await _evaluate(
      'unUnicode(decodeData(${jsonEncode(data.toJson())}, ${jsonEncode(aes)}));',
    );
    return _smartDecode(jsonDecode(first));
  }

  /// Encode generic data
  Future<Encrypted> encodeData(dynamic data, String aes) async {
    final escapedData = jsonEncode(_escapeUnicodeCharacters(jsonEncode(data)));
    return Encrypted.fromJson(
      _smartDecode(
        jsonDecode(
          await _evaluate('encodeData($escapedData, ${jsonEncode(aes)});'),
        ),
      ),
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Decode encrypted private key
  Future<PCryptKey> decodePrivateKey(PCryptKey key, String aes) async {
    return PCryptKey(
      info: key.info,
      algorithm: key.algorithm,
      version: key.version,
      type: key.type,
      encoding: key.encoding,
      ecdh: EllipticCurve(
        curve: key.ecdh.curve,
        data: _smartDecode(
          await _evaluate(
            'decodeData(${jsonEncode(key.ecdh.data)}, ${jsonEncode(aes)});',
          ),
        ),
      ),
      ecdsa: EllipticCurve(
        curve: key.ecdsa.curve,
        data: _smartDecode(
          await _evaluate(
            'decodeData(${jsonEncode(key.ecdsa.data)}, ${jsonEncode(aes)});',
          ),
        ),
      ),
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Decode binary data
  Future<Uint8List> decodeBinaryData(Encrypted data, String aes) async {
    final String result = await _evaluate(
      'decodeData(${jsonEncode(data.toJson())}, ${jsonEncode(aes)});',
    );
    return latin1.encode(_smartDecode(result));
  }

  /// Encode binary data (list of bytes)
  Future<Encrypted> encodeBinaryData(Uint8List data, String aes) async {
    final result = await _evaluate(
      'encodeData(${jsonEncode(latin1.decode(data))}, ${jsonEncode(aes)});',
    );
    return Encrypted.fromJson(_smartDecode(jsonDecode(result)));
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Generate shared key based on a pair of private/public keys
  Future<String> getSharedKey(
    PCryptKey? publicKey,
    PCryptKey privateKey,
  ) async {
    return _smartDecode(
      await _evaluate(
        'pcrypt.getsharedsecret(${jsonEncode(privateKey.toJson())}, ${publicKey != null ? jsonEncode(publicKey.toJson()) : 'null'});',
      ),
    );
  }

  /// Get team keys for the teams specified by id list, based on members
  Future<Map<int, Map<int, String>>> getTeamKeys(
    List<int> teamIds,
    List<TeamMember> members,
    int myId,
    PCryptKey privateKey,
    String aes,
  ) async {
    //Prepare team ids
    final teamIdsData = jsonEncode(teamIds);
    //Prepare members
    final membersData = jsonEncode(
      members.map((m) {
        final map = m.toJson();
        map['publickey'] = jsonEncode(map['publickey']);
        return map;
      }).toList(),
    );
    //Prepare other fields
    final privateKeyData = jsonEncode(privateKey.toJson());
    final aesData = jsonEncode(aes);

    final Map<String, dynamic> result = _smartDecode(
      await _evaluate(
        'handleTeamKeys($teamIdsData, $membersData, false, false, false, $myId, $privateKeyData, $aesData)',
      ),
    );

    return result.map<int, Map<int, String>>((String teamId, dynamic usersMap) {
      return MapEntry<int, Map<int, String>>(
        int.parse(teamId),
        usersMap is Map<String, dynamic>
            ? usersMap.map<int, String>((String userId, dynamic key) {
                return MapEntry(int.parse(userId), key.toString());
              })
            : <int, String>{},
      );
    });
  }

  /// Decode encrypted passwords shared by users or teams
  ///
  /// Returns maps, lists, strings, and literally any other types (depending on context)
  Future<Encrypted> markNewShares(
    List<TeamShare> shares,
    String aes,
    Map<String, dynamic> lastShares,
  ) async {
    // Prepare shares
    final userSharesData = shares
        .where((s) => s.type == TeamShareType.user)
        .map((s) {
          final map = s.toJson();
          map['data'] = jsonEncode(map['data']);
          return map;
        })
        .toList();
    final teamSharesData = shares
        .where((s) => s.type == TeamShareType.team)
        .map((s) {
          final map = s.toJson();
          map['data'] = jsonEncode(map['data']);
          return map;
        })
        .toList();
    final sharesData = jsonEncode(userSharesData + teamSharesData);

    // Prepare other fields
    final oldShareIds = jsonEncode(lastShares);
    // Execute methods
    final evaluateResult = await _evaluate(
      'markNewShares($sharesData, $oldShareIds);',
    );
    final Map<String, dynamic> decodedResult = jsonDecode(evaluateResult);
    final dynamic sharesResult = _smartDecode(decodedResult);
    final data = await encodeData(sharesResult, aes);
    return data;
  }

  /// Decode encrypted passwords shared by users or teams
  ///
  /// Returns maps, lists, strings, and literally any other types (depending on context)
  Future<SharedPasswordModel> decodeSharedPasswords(
    List<TeamShare> shares,
    Map<int, Map<int, String>> teamKeys,
    List<TeamMember> members,
    PCryptKey privateKey,
    String email,
    int currentId,
  ) async {
    // Prepare shares
    final userSharesData = jsonEncode(
      shares.where((s) => s.type == TeamShareType.user).map((s) {
        final map = s.toJson();
        map['data'] = jsonEncode(map['data']);
        return map;
      }).toList(),
    );
    final teamSharesData = jsonEncode(
      shares.where((s) => s.type == TeamShareType.team).map((s) {
        final map = s.toJson();
        map['data'] = jsonEncode(map['data']);
        return map;
      }).toList(),
    );
    // Prepare members
    final teamKeysData = jsonEncode(
      teamKeys.map<String, dynamic>((int teamId, Map<int, String> usersMap) {
        return MapEntry<String, dynamic>(
          teamId.toString(),
          usersMap.map<String, dynamic>((int userId, String key) {
            return MapEntry<String, dynamic>(userId.toString(), key);
          }),
        );
      }),
    );
    final membersData = jsonEncode(
      members.map((m) {
        final map = m.toJson();
        map['publickey'] = jsonEncode(map['publickey']);
        return map;
      }).toList(),
    );
    // Prepare other fields
    final privateKeyData = jsonEncode(privateKey.toJson());
    final emailData = jsonEncode(email);

    // Execute methods
    final List<dynamic> decryptedTeam = _smartDecode(
      jsonDecode(
        await _evaluate(
          'unUnicode(decryptShareData($teamSharesData, convertteammembers($membersData, $currentId), $teamKeysData, $privateKeyData, $emailData));',
        ),
      ),
    );

    final List<dynamic> decryptedUser = _smartDecode(
      jsonDecode(
        await _evaluate(
          'unUnicode(decryptShareData($userSharesData, convertteammembers($membersData, $currentId), $teamKeysData, $privateKeyData, $emailData));',
        ),
      ),
    );

    final List<Password> userPasswords = decryptedUser
        .map<List<Password>>((dynamic object) {
          final int key = object['userid'];
          final creator = members.firstWhere((m) => m.userId == key);
          final List<Password> value = List<Password>.from(
            object['data'].map((dynamic e) {
              final password = Password.fromJson(e);
              password.creator = creator;
              // password.isNewlyShared = object['read'] == 0;
              password.type = PasswordType.userShare;
              return password;
            }),
          );
          return value;
        })
        .expand((lp) => lp)
        .toList();

    final List<Password> teamPasswords = decryptedTeam
        .map<List<Password>>((dynamic teamValue) {
          final int keyId = teamValue['keyid'];
          final int teamid = teamValue['teamid'];
          return List<Password>.from(
            teamValue['data'].map((dynamic e) {
              final password = Password.fromJson(e);
              password.creator = members.firstWhere(
                (m) => m.userId == teamValue['userid'] && m.teamId == teamid,
              );
              password.teamKey = teamKeys[teamid]?[keyId];
              // password.isNewlyShared = teamValue['read'] == 0;
              password.type = PasswordType.teamShare;
              return password;
            }),
          );
        })
        .expand((lp) => lp)
        .toList();
    return SharedPasswordModel(
      userSharedPasswords: userPasswords,
      teamSharedPasswords: teamPasswords,
    );
  }

  Future<Map<int, List<int>>> findShareChanges(
    Map<int, List<int>> oldShares,
    Map<int, List<int>> newShares,
  ) async {
    final encodedOld = jsonEncode(
      oldShares.map<String, dynamic>((int id, List<int> teamsMap) {
        return MapEntry<String, dynamic>(id.toString(), teamsMap);
      }),
    );
    final encodedNew = jsonEncode(
      newShares.map<String, dynamic>((int id, List<int> teamsMap) {
        return MapEntry<String, dynamic>(id.toString(), teamsMap);
      }),
    );
    final result = await _evaluate(
      'findShareChanges($encodedOld, $encodedNew);',
    );
    final Map<String, dynamic> decodedResult = _smartDecode(jsonDecode(result));
    return Map<int, List<int>>.from(
      decodedResult.map<int, List<int>>(
        (String k, dynamic v) => MapEntry(int.parse(k), List<int>.from(v)),
      ),
    );
  }

  /// First part in the password sharing process
  ///
  /// Prepares share data and new file id list
  Future<Share1Result> sharePasswordsPart1(
    List<Password> passwords,
    List<TeamMember> members,
    Map<String, dynamic> serverFileData,
    int currentId,
    bool fileChanges,
  ) async {
    //Prepare passwords
    final passwordsData = _escapeUnicodeCharacters(jsonEncode(passwords));
    //Prepare members
    final membersData = jsonEncode(
      members.map((m) {
        final map = m.toJson();
        map['publickey'] = jsonEncode(map['publickey']);
        return map;
      }).toList(),
    );
    //Prepare team binary info
    final serverFileDataJson = jsonEncode(serverFileData);
    //Execute method
    return Share1Result.fromJson(
      _smartDecode(
        jsonDecode(
          await _evaluate(
            'buildShareData_1($passwordsData, convertteammembers($membersData, $currentId), $serverFileDataJson, $fileChanges);',
          ),
        ),
      ),
    );
  }

  /// Second part in the password sharing process
  Future<Share2ResultV2> sharePasswordsPart2(
    Share1Result share1,
    Map<String, Encrypted> newBinaries,
    List<TeamMember> members,
    Map<String, dynamic> serverFileData,
    PCryptKey privateKey,
    int currentId,
    bool fileChanges,
    Map<int, Map<int, String>> teamKeys,
  ) async {
    //Prepare share data
    final encodedShare1 = share1.toJson();
    final String shareData = jsonEncode(encodedShare1['sharedata']);
    final String newFileIds = jsonEncode(encodedShare1['newfileids']);
    final String fileData = jsonEncode(
      newBinaries.map((k, v) => MapEntry(k, jsonEncode(v.toJson()))),
    );
    final teamKeysData = jsonEncode(
      teamKeys.map<String, dynamic>((int teamId, Map<int, String> usersMap) {
        return MapEntry<String, dynamic>(
          teamId.toString(),
          usersMap.map<String, dynamic>((int userId, String key) {
            return MapEntry<String, dynamic>(userId.toString(), key);
          }),
        );
      }),
    );
    //Prepare members
    final membersData = jsonEncode(
      members.map((m) {
        final map = m.toJson();
        map['publickey'] = jsonEncode(map['publickey']);
        return map;
      }).toList(),
    );
    //Prepare team binary info
    final serverFileDataJson = jsonEncode(serverFileData);
    //Prepare other fields
    final privateKeyData = jsonEncode(privateKey.toJson());
    //Execute method
    final evaluateResult = await _evaluate(
      'buildShareData_2($shareData, $newFileIds, $fileData, convertteammembers($membersData, $currentId), $serverFileDataJson, $privateKeyData, $fileChanges, $teamKeysData);',
    );
    final Map<String, dynamic> result = _smartDecode(
      jsonDecode(evaluateResult),
    );
    final shareResult = Share2ResultV2.fromJson(result);
    return shareResult;
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Generate hash for specified encrypted data
  Future<String> hash(Encrypted data) async {
    return _smartDecode(
      await _evaluate('hash(${jsonEncode(jsonEncode(data.toJson()))});'),
    );
  }

  /// Generate hash for specified encrypted data
  Future<String> hashMap(Map<dynamic, Encrypted> data) async {
    final String dataString = jsonEncode(
      jsonEncode(
        data.map<String, String>((dynamic k, v) {
          return MapEntry(k.toString(), jsonEncode(v.toJson()));
        }),
      ),
    );
    return _smartDecode(await _evaluate('hash($dataString);'));
  }

  /// Generate hash for empty data
  Future<String> emptyHash() async {
    return _smartDecode(await _evaluate('hash(${jsonEncode('')});'));
  }

  /// Generate hash for string data
  Future<String> stringHash(String data) async {
    return _smartDecode(await _evaluate('hash(${jsonEncode(data)});'));
  }
}
