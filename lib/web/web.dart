import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/model/configuration.dart';
import 'package:telnor/model/encrypted.dart';
import 'package:telnor/model/geocode_result.dart';
import 'package:telnor/model/global_message.dart';
import 'package:telnor/model/language.dart';
import 'package:telnor/model/location.dart';
import 'package:telnor/model/login.dart';
import 'package:telnor/model/login_result.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/share_result.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/model/user.dart';
import 'package:telnor/util/readonly_service.dart';
import 'package:telnor/util/strings.dart';

///Class which performs all network-related interactions
class WebProvider {
  WebProvider._() {
    initialization = _initialize();
  }

  static final WebProvider get = WebProvider._();

  late final Future<void> initialization;

  static const DEFAULT_SERVER =
      'https://gestorcontrasenastelmex.pandasecurity.com';

  String _currentServer = '';

  String get currentServer => _currentServer;

  String get _endpoint => '/lib/pcrypt.php';
  final _readOnlyService = ReadOnlyService();

  String get _strings => '$_currentServer/lib/lang/languagedb.php';

  Dio? _dioClient;

  Dio? getClient({bool enforceDefaultDomain = false}) {
    initClient(enforceDefaultDomain: enforceDefaultDomain);
    return _dioClient;
  }

  Dio? initClient({bool enforceDefaultDomain = false}) {
    if (kDebugMode) {
      print('DIO INIT client');
    }
    _dioClient = Dio(
      BaseOptions(
        baseUrl: enforceDefaultDomain ? DEFAULT_SERVER : _currentServer,
        connectTimeout: const Duration(seconds: 8),
        receiveTimeout: const Duration(seconds: 8),
        headers: _headers,
      ),
    );
    _dioClient?.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          return handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            print('--------response.requestOptions.uri');
            print(response.requestOptions.uri);
          }
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          if (kDebugMode) {
            print('ERROR-------------------------------Request : ${e.message}');
          }
          return handler.next(e);
        },
      ),
    );
    return _dioClient;
  }

  ///Initialize server value with persisted URL
  Future<void> _initialize() async {
    _currentServer =
        (await SharedPreferences.getInstance()).getString('web_server') ??
        DEFAULT_SERVER;
  }

  ///Change current host for web requests
  Future<void> changeServer(String url) async {
    _currentServer = url;
    getClient()?.options.baseUrl = _currentServer;
    (await SharedPreferences.getInstance()).setString('web_server', url);
  }

  //--------------------------------------------------------------------------------------------------------------------

  final Map<String, String> _headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  /// Generic request method that handles all the necessary routines.
  /// Parameter specifies the type of object this method returns as a response (in case of success)
  ///
  /// [method] defines an API method to request
  /// [session] contains the identifier of the current session. May be [null] for login requests
  /// [bodyData] is the JSON string that should be send as "data" inside the body. Consult API documentation for specific values
  /// [resultTransformer] is optional function that transforms resulting data (of various types) to the needed result type (parameter T)
  ///
  /// In case of success, return object of [WebResult] will contain non-null [WebResult.data] variable
  /// If some error happened during server request, the resulting object will contain a non-null [WebResult.error] variable of type [WebError].
  /// Each [WebError] consists of error [code] and error [message]
  ///
  /// Below is the list of all error codes returned by the server
  /// 1 => "Unable to connect to DB",
  /// 2 => "Unknown method specified",
  /// 3 => "Wrong number of arguments",
  /// 4 => "SQL error: ",
  /// 5 => "User is no longer member of team",
  /// 6 => "Account already exist",
  /// 7 => "Unknown user",
  /// 8 => "Email is not the same",
  /// 9 => "Email adr. is not validated",
  /// 10 => "Client checksum is not validated",
  /// 11 => "Unknown error",
  /// 12 => "No records found or affected: ",
  /// 13 => "Mail error: ",
  /// 14 => "User is not logged in",
  /// 15 => "Too long time used",
  /// 16 => "Wrong password or pincode",
  /// 17 => "User is not admin",
  /// 18 => "Share error",
  /// 19 => "Unable to remove last team admin",
  /// 20 => "Wrong parameter type",
  /// 21 => "Unable to decode json data: ",
  /// 22 => "SRP error: ",
  /// 23 => "Storage maximum size exceeded",
  /// 24 => "Hash check failed",
  /// 25 => "Wrong type of arguments",
  /// 26 => "This functionality is disabled",
  /// 27 => "Payment period is wrong",
  /// 28 => "Calculated price does not equal requested price",
  /// 29 => "User is not premium"
  ///
  /// Special type 0 is user for errors not related to server scripts
  Future<WebResult<T>> _genericWebRequest<T>(
    String method,
    String? session,
    String bodyData, {
    T Function(dynamic)? resultTransformer,
    bool enforceDefaultDomain = false,
  }) async {
    try {
      final String body =
          '{"method": "$method", "session": "$session", "data": $bodyData, "id": "0" }';
      final res = await getClient(
        enforceDefaultDomain: enforceDefaultDomain,
      )?.post<dynamic>(_endpoint, data: body);

      if (res != null && res.statusCode == 200) {
        // print(res.data);
        final Map<String, dynamic> data = res.data;
        if (data['error'] != null) {
          return WebResult.error(data['error'], data['result']);
        }
        return WebResult.success(
          resultTransformer != null
              ? resultTransformer(data['result'])
              : data['result'],
        );
      } else {
        return WebResult.error(0, res?.statusMessage ?? '');
      }
    } on TimeoutException catch (error) {
      if (kDebugMode) {
        print('Web Result error $error');
      }
      return WebResult.error(-10, 'Cannot connect to server');
    } on DioException catch (error, stackTrace) {
      if (kDebugMode) {
        print('Web Result error $error \nStackTrace: ${stackTrace.toString()}');
      }
      if (error.type == DioExceptionType.connectionError) {
        return WebResult.error(-10, 'Cannot connect to server');
      } else if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.receiveTimeout) {
        return WebResult.error(-10, 'Cannot connect to server');
      }
      makeErrorLog(session, error.toString());
      return WebResult.error(0, Strings.messageUnknownError);
    } catch (error, stackTrace) {
      if (kDebugMode) {
        print(
          'method: $method Web Result error $error \n stackTrace: $stackTrace',
        );
      }
      makeErrorLog(session, error.toString());
      return WebResult.error(0, Strings.messageUnknownError);
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  ///First step in login process
  Future<WebResult<Login1Result>> loginStep1(String email) async {
    return _genericWebRequest(
      'login1',
      null,
      '{"email": "$email"}',
      resultTransformer: (dynamic data) => Login1Result.fromJson(data),
    );
  }

  ///Second step in login process
  Future<WebResult<Login2Result>> loginStep2(
    String email,
    String srpA,
    String srpM1,
    String? pin,
  ) async {
    return _genericWebRequest(
      'login2',
      null,
      '{"email": "$email", "srpA": "$srpA", "srpM1": "$srpM1", "pincode": $pin}',
      resultTransformer: (dynamic result) {
        result['publickey'] = jsonDecode(result['publickey']);
        result['privatekey'] = jsonDecode(result['privatekey']);
        result['privatekey']['ecdh']['data'] = jsonDecode(
          result['privatekey']['ecdh']['data'],
        );
        result['privatekey']['ecdsa']['data'] = jsonDecode(
          result['privatekey']['ecdsa']['data'],
        );
        return Login2Result.fromJson(result);
      },
    );
  }

  /// Get global emergency status
  Future<WebResult<bool>> globalEmergencyStatus(String session) async {
    return _genericWebRequest(
      'globalemergencystatus',
      session,
      '{}',
      resultTransformer: (dynamic result) {
        return result as bool;
      },
    );
  }

  /// Global Emergency Setup
  Future<WebResult<Map<String, dynamic>?>> globalEmergencySetup(
    String session,
  ) async {
    return _genericWebRequest(
      'globalemergencysetup',
      session,
      '{}',
      resultTransformer: (dynamic result) {
        (result['uid'] as Map<String, dynamic>?)?.forEach((key, dynamic value) {
          final publicKey =
              jsonDecode(value['publickey']) as Map<String, dynamic>?;
          result['uid'][key]['publickey'] = publicKey;
        });
        // print(result);
        return result as Map<String, dynamic>?;
      },
    );
  }

  /// set global emergency
  Future<WebResult<void>> globalSetEmergency(
    String session,
    Map<String, dynamic> encryptedPasswords,
  ) async {
    return _genericWebRequest(
      'globalsetemergency',
      session,
      jsonEncode(encryptedPasswords),
      resultTransformer: (dynamic result) {
        // print(result);
        return;
      },
    );
  }

  ///Register new user
  Future<WebResult<int>> signUp(AccountData data, Language language) async {
    return _genericWebRequest(
      'create',
      null,
      '{"email": "${data.email}", "srpsalt": "${data.srpSalt}", "srpverifier": "${data.srpVerifier}", "salt": "${data.salt}", "publickey": ${jsonEncode(jsonEncode(data.publicKey.toJson()))}, "privatekey": ${jsonEncode(jsonEncode(data.privateKey.toJson()))}, "emaillanguage": "${language.code}"}',
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  ///Retrieve generic encrypted data
  Future<WebResult<Encrypted?>> getEncryptedData(
    String session,
    DataName dataName,
  ) async {
    if (await Preferences().readonlyMode == true) {
      final enc = await _readOnlyService.getEncrypted(dataName);

      return WebResult.success(enc);
    } else {
      final enc = await _genericWebRequest(
        'getdata',
        session,
        '{"dataname": "${dataName.name}"}',
        resultTransformer: (dynamic result) {
          return result['datastring']?.isNotEmpty
              ? Encrypted.fromJson(jsonDecode(result['datastring']))
              : null;
        },
      );
      if (enc.data != null) {
        await _readOnlyService.addEncrypted(enc.data!, dataName);
      }
      return enc;
    }
  }

  /// Save generic encrypted data
  Future<WebResult<bool>> setEncryptedData(
    String session,
    DataName dataName,
    Encrypted? data,
    String hash,
  ) async {
    final String dataString = data == null ? '' : jsonEncode(data.toJson());
    final String body =
        '{"dataname": "${dataName.name}", "datastring": ${jsonEncode(dataString)}, "hash": "$hash", "backup": true}';
    return _genericWebRequest('setdata', session, body);
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load binary data
  Future<WebResult<Encrypted>> getBinaryData(
    String session,
    String fileId,
  ) async {
    return _genericWebRequest(
      'getbinary',
      session,
      '{"dataname": "$fileId"}',
      resultTransformer: (dynamic result) {
        return Encrypted.fromJson(jsonDecode(result[fileId]));
      },
    );
  }

  /// Load binary data
  Future<WebResult<Map<String, Encrypted>>> getBinaryDataList(
    String session,
    List<String> fileIds,
  ) async {
    return _genericWebRequest(
      'getbinary',
      session,
      '{"dataname": ${jsonEncode(fileIds)}}',
      resultTransformer: (dynamic result) {
        if (result.isEmpty) {
          return <String, Encrypted>{};
        }
        return result.map<String, Encrypted>(
          (dynamic k, dynamic v) =>
              MapEntry(k.toString(), Encrypted.fromJson(jsonDecode(v))),
        );
      },
    );
  }

  /// Load binary data shared by other user
  Future<WebResult<Encrypted>> getUserSharedBinaryData(
    String session,
    String fileId,
    int fromId,
  ) async {
    return _genericWebRequest(
      'teamgetbinary',
      session,
      '{"dataname": "$fileId", "fromid": $fromId}',
      resultTransformer: (dynamic result) {
        final String data = result[fileId];
        if (data.isEmpty) {
          throw 'Binary data is empty';
        }
        return Encrypted.fromJson(jsonDecode(data));
      },
    );
  }

  /// Load binary data shared by other team
  Future<WebResult<Encrypted>> getTeamSharedBinaryData(
    String session,
    String fileId,
    int teamId,
  ) async {
    return _genericWebRequest(
      'teamgetteambinary',
      session,
      '{"dataname": "$fileId", "teamid": $teamId}',
      resultTransformer: (dynamic result) {
        final String data = result[fileId]['data'];
        if (data.isEmpty) {
          throw 'Binary data is empty';
        }
        return Encrypted.fromJson(jsonDecode(data));
      },
    );
  }

  /// Save binary data
  Future<WebResult<bool>> setBinaryData(
    String session,
    String fileId,
    Encrypted data,
  ) async {
    final String dataString = jsonEncode(data.toJson());
    return _genericWebRequest(
      'setbinary',
      session,
      '{"dataname": "$fileId", "datastring": ${jsonEncode(dataString)}}',
    );
  }

  /// Remove binary data
  Future<WebResult<bool>> removeBinaryData(
    String session,
    List<String> fileIds,
  ) async {
    final String dataName = jsonEncode(fileIds);
    final String dataString = jsonEncode(fileIds.map((g) => '').toList());
    return _genericWebRequest(
      'setbinary',
      session,
      '{"dataname": $dataName, "datastring": $dataString}',
    );
  }

  /// Load favicon (base64-encoded) image data for specified URLs
  Future<WebResult<List<String>>> loadFaviconData(
    String session,
    List<String> urls,
  ) async {
    final data = jsonEncode(urls.where((u) => u.isNotEmpty).toList());
    if (await Preferences().readonlyMode == true) {
      final icons = await _readOnlyService.getFavicons();
      return WebResult.success(icons);
    } else {
      List<String> iconsToSave = [];
      final icons = await _genericWebRequest(
        'getfavicon',
        session,
        '{"url": $data}',
        resultTransformer: (dynamic result) {
          iconsToSave = urls.map<String>((u) {
            if (u.isNotEmpty && result[u] != null) {
              switch (result[u]['status']) {
                case 2:
                  return result[u]['image'] ?? '';
                case 0:
                  return result?['waiting']?['image'] ?? '';
                default:
                  return result?['default']?['image'] ?? '';
              }
            }
            if (result.runtimeType == List) {
              return '';
            }
            return result?['default']?['image'] ?? '';
          }).toList();

          return iconsToSave;
        },
      );
      iconsToSave = iconsToSave;

      await _readOnlyService.addFavicon(iconsToSave);
      return icons;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Make Error log to server
  Future<WebResult<bool>> makeErrorLog(
    String? session,
    String errorText,
  ) async {
    final requestBody = {
      'label': 'fluttererror',
      'text': errorText,
      'shown': false,
    };
    final encoded = jsonEncode(requestBody);
    return _genericWebRequest('makelogentrylabel', session, encoded);
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Get list of teams current user is a part of
  Future<WebResult<List<Team>>> getTeamInfo(String session) async {
    return _genericWebRequest(
      'teaminfo',
      session,
      '{}',
      resultTransformer: (dynamic data) {
        if (data == false || data.isEmpty) {
          return <Team>[];
        }
        return List<Team>.from(
          data
              .map(
                (String k, dynamic v) =>
                    MapEntry<String, Team>(k, Team.fromJson(int.parse(k), v)),
              )
              .values,
        );
      },
    );
  }

  /// Get list of team members of all teams user is part of
  Future<WebResult<List<TeamMember>>> getTeamMembers(String session) async {
    return _genericWebRequest(
      'teammembers',
      session,
      '{}',
      resultTransformer: (dynamic data) {
        if (data == false || data.isEmpty) {
          return <TeamMember>[];
        }

        return List<TeamMember>.from(
          data.map<TeamMember>((dynamic e) {
            if (e['publickey'] != null) {
              e['publickey'] = jsonDecode(e['publickey']);
            }
            if (e['teamkeysdata'] != null) {
              e['teamkeysdata'] = jsonDecode(e['teamkeysdata']);
            }
            return TeamMember.fromJson(e);
          }),
        );
      },
    );
  }

  /// Get list of team members avatars of all teams user is part of
  Future<WebResult<Map<int, Uint8List>>> getTeamMembersAvatars(
    String session,
  ) async {
    final avatars = await _genericWebRequest(
      'teamgetavatars',
      session,
      '{}',
      resultTransformer: (dynamic data) {
        if (data == false || data.isEmpty) {
          return <int, Uint8List>{};
        }
        return Map<int, Uint8List>.from(
          data.map<int, Uint8List>((dynamic k, dynamic v) {
            return MapEntry<int, Uint8List>(
              k == 'default' ? -1 : int.parse(k),
              base64Decode(v),
            );
          }),
        );
      },
    );
    return avatars;
  }

  /// Get list of passwords shared by other members
  Future<WebResult<List<TeamShare>>> getTeamShares(String session) async {
    if (await Preferences().readonlyMode == true) {
      final teamShare = await _readOnlyService.getTeamShare();

      return WebResult.success(teamShare);
    } else {
      final shares = await _genericWebRequest(
        'teamgetshares',
        session,
        '{}',
        resultTransformer: (dynamic data) {
          if (data == false || data.isEmpty) {
            return <TeamShare>[];
          }
          return List<TeamShare>.from(
            data.map<TeamShare>((dynamic e) {
              e['data'] = jsonDecode(e['data']);
              return TeamShare.fromJson(e);
            }),
          );
        },
      );
      await _readOnlyService.addTeamShare(shares.data!);

      return shares;
    }
  }

  /// Share list of passwords to other members
  Future<WebResult<void>> setMemberShares(
    String session,
    String? dataString,
    String hash,
  ) async {
    return _genericWebRequest(
      'teamsetshares',
      session,
      '{"datastring": ${jsonEncode(dataString)}, "hash": "$hash"}',
    );
  }

  /// Share list of passwords to teams
  Future<WebResult<void>> setTeamShares(
    String session,
    String dataString,
    String hash,
  ) async {
    return _genericWebRequest(
      'teamsetteamshares',
      session,
      '{"datastring": ${jsonEncode(dataString)}, "hash": "$hash"}',
    );
  }

  /// Get list of team binaries that were changed
  Future<WebResult<List<TeamBinary>>> getTeamBinaryInfo(String session) async {
    return _genericWebRequest(
      // todo see pcrypt_teamgetbinaryinfo2, updated to teamgetbinaryinfo2
      'teamgetbinaryinfo',
      session,
      '{}',
      resultTransformer: (dynamic data) {
        if (data.isEmpty) {
          return <TeamBinary>[];
        }
        return List<TeamBinary>.from(
          data
              .map<String, Map<String, TeamBinary>>((String k1, dynamic v1) {
                return MapEntry<String, Map<String, TeamBinary>>(
                  k1,
                  v1.map<String, TeamBinary>((String k2, dynamic v2) {
                    return MapEntry<String, TeamBinary>(
                      k2,
                      TeamBinary.fromJson(k2, int.parse(k1), v2),
                    );
                  }),
                );
              })
              .values
              .expand((Map<String, TeamBinary> e) => e.values)
              .toList(),
        );
      },
    );
  }

  /// Get list of team binaries that were changed v2
  Future<WebResult<Map<String, dynamic>>> getTeamBinaryInfoV2(
    String session,
  ) async {
    return _genericWebRequest(
      'teamgetbinaryinfo2',
      session,
      '{}',
      resultTransformer: (dynamic data) {
        return data;
      },
    );
  }

  /// Share encrypted files to member
  Future<WebResult<void>> setMemberBinary(
    String session,
    List<UserFileShare> shareFiles,
    Map<int, List<String>> noDelSource,
  ) async {
    // Prepare arrays
    final toIds = jsonEncode(shareFiles.map((f) => f.toId.toString()).toList());
    final dataNames = jsonEncode(shareFiles.map((f) => f.fileId).toList());
    final dataStrings = jsonEncode(
      shareFiles.map((f) => jsonEncode(f.data)).toList(),
    );
    //Prepare no del source
    final noDelSourceData = jsonEncode(
      noDelSource.map<String, List<String>>((int k, List<String> v) {
        return MapEntry(k.toString(), v);
      }),
    );
    return _genericWebRequest(
      'teamsetbinary',
      session,
      '{"toid": $toIds, "sourcename": $dataNames, "datastring": $dataStrings, "nodelsource": $noDelSourceData}',
    );
  }

  /// Share encrypted files to teams
  Future<WebResult<void>> setTeamBinary(
    String session,
    List<TeamFileShare> shareFiles,
    Map<int, List<String>> noDelSource,
  ) async {
    // Prepare arrays
    final teamId = jsonEncode(
      shareFiles.map((f) => f.teamId.toString()).toList(),
    );
    final keyId = jsonEncode(shareFiles.map((f) => f.keyId).toList());
    final sourceNames = jsonEncode(shareFiles.map((f) => f.fileId).toList());
    final dataStrings = jsonEncode(
      shareFiles.map((f) => jsonEncode(f.data)).toList(),
    );
    //Prepare no del source
    final noDelSourceData = jsonEncode(
      noDelSource.map<String, List<String>>((int k, List<String> v) {
        return MapEntry(k.toString(), v);
      }),
    );
    return _genericWebRequest(
      'teamsetteambinary',
      session,
      '{"teamid": $teamId, "keyid": $keyId, "sourcename": $sourceNames, "datastring": $dataStrings, "nodelsource": $noDelSourceData}',
    );
  }

  /// Create new team on the server
  Future<WebResult<TeamMemberIdPair>> createTeam(
    String session,
    String name,
    String contact,
    String email,
  ) async {
    return _genericWebRequest(
      'teamcreate',
      session,
      '{"name": "$name", "contact": "$contact", "email": "$email", "options": 0 }',
      //!!! maybe change options
      resultTransformer: (dynamic result) {
        return TeamMemberIdPair.fromJson(result);
      },
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Add new team members (specified by emails) to new teams (specified by ids)
  Future<WebResult<void>> addNewTeamMembers(
    String session,
    List<TeamMember> members,
    Language language,
  ) {
    final teamIds = jsonEncode(members.map((m) => m.teamId).toList());
    final emails = jsonEncode(members.map((m) => m.email).toList());
    final admins = jsonEncode(members.map((m) => 0).toList());
    final options = jsonEncode(members.map((m) => 0).toList());
    return _genericWebRequest(
      'teamaddmember',
      session,
      '{"teamid": $teamIds, "email": $emails, "admin": $admins, "options": $options, "emaillanguage": "${language.code}"}',
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load list of messages for current user (grouped by box)
  Future<WebResult<Map<MessagesBox, List<MessageEncrypted>>>> loadMessages(
    String session,
  ) {
    return _genericWebRequest(
      'teamgetmail',
      session,
      '{}',
      resultTransformer: (dynamic result) {
        if (result.isEmpty) {
          return {MessagesBox.inbox: [], MessagesBox.outbox: []};
        }
        List<MessageEncrypted> parseList(List<dynamic> data) => data
            .map<MessageEncrypted?>((dynamic d) {
              final dynamic data = d['data'];
              try {
                d['data'] = jsonDecode(data);
                return MessageEncrypted.fromJson(d);
              } catch (error) {
                return null;
              }
            })
            .where((m) => m != null)
            .map<MessageEncrypted>((m) => m!)
            .toList();
        return {
          MessagesBox.inbox: parseList(result['to']),
          MessagesBox.outbox: parseList(result['from']),
        };
      },
    );
  }

  ///Register new user
  Future<WebResult<Map<int, int>>> sendMessage(
    String session,
    Encrypted from,
    Map<int, Encrypted> to,
    Language language,
  ) async {
    final String fromData = jsonEncode(jsonEncode(from.toJson()));
    final String toData = jsonEncode(
      to.map<String, String>((int k, Encrypted v) {
        return MapEntry<String, String>(k.toString(), jsonEncode(v.toJson()));
      }),
    );
    return _genericWebRequest(
      'teamsendmail',
      session,
      '{"fromdata": $fromData, "todata": $toData, "emaillanguage": "${language.code}"}',
      resultTransformer: (dynamic result) {
        return result.asMap().map<int, int>((int i, dynamic m) {
          return MapEntry<int, int>(m['userid'], m['mailid']);
        });
      },
    );
  }

  /// Delete specified messages from the server
  Future<WebResult<void>> deleteMessages(
    String session,
    List<Message> messages,
  ) async {
    if (messages.isNotEmpty) {
      final ids = messages.map((m) => m.mailId).join(',');
      return _genericWebRequest(
        'teamremovemail',
        session,
        '{"mailid": [$ids]}',
      );
    }
    return WebResult.success(null);
  }

  /// Delete User accounts
  Future<WebResult<void>> deleteAccount(String session, String email) async {
    try {
      final stuff = await _genericWebRequest(
        'delete',
        session,
        '{"email": "$email"}',
        enforceDefaultDomain: true,
      );

      return stuff;
    } catch (err) {
      rethrow;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Save user info to the server
  Future<WebResult<void>> updateUserInfo(String session, User user) async {
    final avatarString = user.avatar.isNotEmpty
        ? base64Encode(user.avatar)
        : '';
    return _genericWebRequest(
      'updateinfo',
      session,
      '{"name": "${user.name}", "department": "${user.department}", "avatarstring": "$avatarString" }',
    );
  }

  /// Check whether user has any updates
  Future<WebResult<UserUpdates>> getUserUpdates(String session) async {
    return _genericWebRequest(
      'teamcheckshare',
      session,
      '{}',
      resultTransformer: (dynamic result) {
        return UserUpdates.fromJson(result);
      },
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load number of global messages
  Future<WebResult<int>> getGlobalMessagesCount(String session) async {
    return _genericWebRequest(
      'countunreadglobalmsgs',
      session,
      '{}',
      resultTransformer: (dynamic data) {
        return data is int ? data : int.parse(data);
      },
    );
  }

  /// Load number of global messages
  Future<WebResult<void>> resetGlobalMessagesCount(String session) async {
    return _genericWebRequest('setlastglobalmsgread', session, '{}');
  }

  /// Load number of global messages
  Future<WebResult<List<GlobalMessage>>> loadGlobalMessages(
    String session,
  ) async {
    return _genericWebRequest(
      'getglobalmsg',
      session,
      '{"drafts": "false"}',
      resultTransformer: (dynamic data) {
        if (data == false || data.isEmpty) {
          return <GlobalMessage>[];
        }
        return List<GlobalMessage>.from(
          data.map<GlobalMessage>((dynamic e) => GlobalMessage.fromJson(e)),
        );
      },
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  ///Get URL to view locations
  String locationViewerUrl(
    String auth,
    Iterable<Location> locations,
    Location? currentLocation,
  ) {
    final buffer = StringBuffer(_currentServer);
    buffer.write('/lib/other/geoshow.php');
    buffer.write('?auth=$auth');
    if (currentLocation != null) {
      buffer.write('&current=');
      buffer.write(currentLocation.latitude);
      buffer.write(',');
      buffer.write(currentLocation.longitude);
      buffer.write(',');
      buffer.write(currentLocation.accuracy);
    }
    buffer.write('&points=');
    for (final location in locations) {
      buffer.write(location.latitude);
      buffer.write(',');
      buffer.write(location.longitude);
      buffer.write(',');
      buffer.write(location.accuracy);
      buffer.write(';');
    }
    return buffer.toString();
  }

  /// Get location coordinates for specific address string
  Future<WebResult<GeocodeResult>> locationFromAddress(
    String auth,
    String address,
  ) async {
    // final url = Uri.parse('$_currentServer/lib/other/geocode.php?auth=$auth');
    try {
      final res = await getClient()?.post<dynamic>(
        '/lib/other/geocode.php?auth=$auth',
        data: address,
      );
      if (res != null && res.statusCode == 200) {
        final Map<String, dynamic> data = res.data;
        return WebResult.success(GeocodeResult.fromJson(data['results'].first));
      } else {
        makeErrorLog(
          null,
          'Could not receive address from location. Status code was not 200',
        );
        return WebResult.error(0, Strings.messageUnknownError);
      }
    } catch (error) {
      return WebResult.error(0, error.toString());
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Generic request method that handles localized strings related routines.
  /// Parameter specifies the type of object this method returns as a response (in case of success)
  ///
  /// [method] defines an API method to request
  /// [language] identifies the language code (ie. 'en') for which the data should be requested
  /// Instead of entire data object, user may query specific [section] using respective (optional) parameter
  /// Instead of entire [section], user may query specific string by specifying the respective (optional) [key] parameter
  /// [resultTransformer] is optional function that transforms resulting JSON (in the form of key-value pairs) to the needed result type (parameter T)
  ///
  /// In case of success, return object of [WebResult] will contain non-null [WebResult.data] variable
  /// If some error happened during server request, the resulting object will contain a non-null [WebResult.error] variable of type [WebError].
  /// Each [WebError] consists of error [code] and error [message]
  /// See documentation of method [_genericWebRequest] for specific code values
  Future<WebResult<T>> _stringsWebRequest<T>(
    String method, {
    Language? language,
    String? section,
    String? key,
    T Function(Map<String, dynamic>)? resultTransformer,
  }) async {
    try {
      final stringDio = Dio(
        BaseOptions(baseUrl: DEFAULT_SERVER, headers: _headers),
      );
      final res = await stringDio.post<dynamic>(
        _strings,
        data: <String, String>{
          'method': method,
          'code': language?.code ?? 'en',
          'index': section ?? '',
          'name': key ?? '',
          'id': '0',
        },
      );
      if (res.statusCode == 200) {
        final Map<String, dynamic> data = res.data;
        if (data['error'] != null) {
          return WebResult.error(data['error'], data['result']);
        }
        return WebResult.success(
          resultTransformer != null
              ? resultTransformer(data['result'])
              : data['result'],
        );
      } else {
        return WebResult.error(0, res.statusMessage ?? '');
      }
    } catch (error) {
      return WebResult.error(0, error.toString());
    }
  }

  /// Get current version of localized strings
  ///
  /// Specify [language] for which the version should be retrieved
  Future<WebResult<int>> getLocalizationVersion(Language language) async {
    return _stringsWebRequest(
      'strings',
      language: language,
      section: 'default',
      key: 'VERSION',
      resultTransformer: (data) => int.parse(data['default']['VERSION']),
    );
  }

  /// Get list of all available languages
  Future<WebResult<List<Language>>> getLocalizationLanguages() async {
    return _stringsWebRequest(
      'languages',
      resultTransformer: (data) => List<Language>.from(
        data
            .map(
              (k, dynamic v) => MapEntry<String, Language>(
                k,
                Language(code: k, name: v['name']),
              ),
            )
            .values,
      ),
    );
  }

  /// Get localized strings for specific [language]
  Future<WebResult<Map<String, dynamic>>> getLocalizationData(
    Language language,
  ) async {
    return _stringsWebRequest(
      'strings',
      language: language,
      resultTransformer: (data) => data,
    );
  }

  ///Get app configuration
  Future<WebResult<RemoteConfiguration>> getRemoteConfig() async {
    if (await Preferences().readonlyMode == true) {
      final conf = await _readOnlyService.getRemoteConfig();
      return WebResult.success(conf!);
    } else {
      final config = await _genericWebRequest(
        'getsystemconfig',
        null,
        '{}',
        resultTransformer: (dynamic result) =>
            RemoteConfiguration.fromJson(result),
        enforceDefaultDomain: true,
      );
      if (config.data != null) {
        await _readOnlyService.addRemoteConfig(config.data!);
      }

      return config;
    }
  }
}

//======================================================================================================================

/// Various data names used in [getdata] and [setdata] requests
class DataName {
  const DataName._(this.name);

  final String name;

  static const DataName passwords = DataName._('passwords');
  static const DataName groups = DataName._('groups');
  static const DataName lastShares = DataName._('lastshares');
}

/// Various errors returned by server
class WebError {
  const WebError(this.code, this.message);

  final int code;
  final String message;
}

/// Generic class used for returning results from web requests
class WebResult<T> {
  const WebResult._(this.data, this.error);

  WebResult.error(int code, String? message)
    : this._(null, WebError(code, message ?? ''));

  WebResult.success(T data) : this._(data, null);

  bool get hasError => error != null;
  final WebError? error;
  final T? data;
}
