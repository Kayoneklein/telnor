import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;

import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/model/configuration.dart';
import 'package:telnor/model/encrypted.dart';
import 'package:telnor/model/geocode_result.dart';
import 'package:telnor/model/global_message.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/location.dart';
import 'package:telnor/model/login.dart';
import 'package:telnor/model/login_result.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/pcrypt_key.dart';
import 'package:telnor/model/share_result.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/model/user.dart';
import 'package:telnor/util/localization.dart';
import 'package:telnor/util/location_service.dart';
import 'package:telnor/util/readonly_service.dart';
import 'package:telnor/util/settings.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/web/scripts.dart';
import 'package:telnor/web/web.dart';

/// High-level class to handle all interactions between application and server.
/// Each method is executed synchronously and result in calling either of two methods:
/// [onSuccess] method is called when interaction is successfully completed. This method will be supplied with the result of the needed type
/// [onError] method triggers when some fault happened during interaction. It will be supplied by the instance of [AdapterError] class
///
/// Surrounding operation calls with try/catch is unnecessary, since all exception handling is performed within the methods
class ServerAdapter {
  ServerAdapter._();

  static final ServerAdapter get = ServerAdapter._();

  final JavaScripts _scripts = JavaScripts.get;
  final WebProvider _web = WebProvider.get;
  final _SecureStorage _storage = _SecureStorage.get;
  final Settings _settings = Settings.get;

  final _readOnlyService = ReadOnlyService();

  /// Helper method to check whether specific [WebResult] contains an error.
  /// If yes, the [onError] callback gets called and *true* is returned.
  /// If no, *false* is returned
  bool checkResultForErrors<T>(
    WebResult<T> result,
    Function(AdapterError)? onError,
  ) {
    if (result.hasError) {
      //Raf
      //FirebaseCrashlytics.instance.recordError(result.error!.message, StackTrace.current);
      final error = AdapterError.fromWebError(result.error!);
      if (error.isSessionExpired) {
        clearSessionData();
      }
      onError?.call(error);
      return true;
    }
    return false;
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Log into the system using specified [email] and [password].
  ///
  /// Two-factor authorization may be required in this case [onPinCodeRequired] callback is fired
  /// Correct pin code should be provided in [pin] argument to proceed
  Future<void> login({
    required String email,
    required String password,
    String? pin,
    Function(User)? onSuccess,
    Function()? onPinCodeRequired,
    Function()? onType2faRequired,
    Function(AdapterError)? onError,
  }) async {
    try {
      //Step 1
      final WebResult<Login1Result> result1 = await _web.loginStep1(email);
      if (checkResultForErrors(result1, onError)) {
        return;
      }
      if (result1.data!.pincode && pin == null) {
        onPinCodeRequired?.call();
        return;
      }
      if (result1.data!.type2fa is String &&
          result1.data!.type2fa == 'autharmor') {
        onType2faRequired?.call();
      }
      final LoginKeys keys = await _scripts.loginStep1Part1(
        result1.data!,
        password,
      );

      final LoginCredentials credentials = await _scripts.loginStep1Part2(
        result1.data!,
        keys,
      );
      //Step 2
      final WebResult<Login2Result> result2 = await _web.loginStep2(
        email,
        credentials.A,
        credentials.m1,
        pin,
      );

      if (checkResultForErrors(result2, onError)) {
        return;
      }
      final user = result2.data!.user;

      ///IMPLEMENT THE OFFLINE/READ-ONLY  FUNCTIONALITY HERE
      ///This functions saves the user in the local database on the device
      ///This would  be eventually used when the device goes into readonly mode
      await _readOnlyService.addUser(user);
      await _settings.setBoolean(Settings.readonlyMode, false);

      final privateKey = await _scripts.decodePrivateKey(
        result2.data!.privateKey,
        keys.aes,
      );

      final String session = await _scripts.loginStep2(result2.data!);

      await _storage.save(_StorageKey.userId, user.id.toString());
      await _storage.save(_StorageKey.email, user.email);
      await _storage.save(
        _StorageKey.privateKey,
        jsonEncode(privateKey.toJson()),
      );
      await _storage.save(_StorageKey.aes, keys.aes);
      await _storage.save(_StorageKey.session, session);
      await _storage.save(_StorageKey.auth, result2.data!.authSession);

      onSuccess?.call(user);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  ///Register in the system with specified [email] and [password]
  Future<void> signUp({
    required String email,
    required String password,
    Function(User)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      //Register new user
      final AccountData data = await _scripts.createAccount(email, password);
      final WebResult<int> result = await _web.signUp(
        data,
        Localization.get.currentLanguage,
      );
      if (checkResultForErrors(result, onError)) {
        return;
      }
      //Login as newly registered user
      await login(
        email: email,
        password: password,
        onSuccess: (user) {
          onSuccess?.call(user);
        },
        onError: (error) {
          onError?.call(error);
        },
      );
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Remove stored session data
  Future<void> clearSessionData() async {
    // await _storage.remove(_StorageKey.session);
    // await _storage.remove(_StorageKey.auth);
    // await _storage.remove(_StorageKey.userId);
    // await _storage.remove(_StorageKey.aes);
    // await _storage.remove(_StorageKey.email);
    // await _storage.remove(_StorageKey.privateKey);
    // await _settings.delete(Settings.kPasswordsPrefKey);
    // await _readOnlyService.closeDB();
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load list of passwords
  Future<void> loadPasswords({
    Function(List<Password>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);

      List<Password> result;

      /// WHEN READONLY MODE IS ACTIVE, THE PASSWORDS WOULD BE STORED LOCALLY
      /// FROM THE DEVICE OF THE USER; BUT WHEN THE READONLY MODE IS NOT ACTIVE,
      /// THEN THE  PASSWORD WILL BE FETCHED FROM THE SERVER

      if (await Preferences().readonlyMode == true) {
        result = await _readOnlyService.getPasswords();
      } else {
        final String aes = await _storage.load(_StorageKey.aes);
        final WebResult<Encrypted?> passwordsResult = await _web
            .getEncryptedData(session, DataName.passwords);

        if (checkResultForErrors(passwordsResult, onError)) {
          return;
        }

        // print(p.length);
        if (passwordsResult.data != null) {
          final dynamic passwordsDecrypted = await _scripts.decodeData(
            passwordsResult.data!,
            aes,
          );
          result = List<Password>.from(
            passwordsDecrypted.map((dynamic e) => Password.fromJson(e)),
          );

          ///ADD Fetched passwords from the server  to the local database
          ///This would be read later
          await _readOnlyService.addPasswords(result);
        } else {
          result = [];
        }
      }

      final iconResult = await _web.loadFaviconData(
        session,
        result.map((p) => p.url).toList(),
      );

      if (checkResultForErrors(iconResult, onError)) {
        return;
      }
      for (int i = 0; i < result.length; i++) {
        if (i < iconResult.data!.length) {
          result[i].icon = base64Decode(iconResult.data![i]);
        }
      }

      onSuccess?.call(result);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Load favorite icon for single password
  Future<void> loadPasswordIcon({
    required String url,
    Function(Uint8List)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final iconResult = await _web.loadFaviconData(session, [url]);
      if (checkResultForErrors(iconResult, onError)) {
        return;
      }
      onSuccess?.call(base64Decode(iconResult.data!.first));
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Load list of password groups
  Future<void> loadGroups({
    Function(List<Group>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final String aes = await _storage.load(_StorageKey.aes);

      final WebResult<Encrypted?> groupsResult = await _web.getEncryptedData(
        session,
        DataName.groups,
      );
      if (checkResultForErrors(groupsResult, onError)) {
        return;
      }

      List<Group> result;
      if (await Preferences().readonlyMode == true) {
        result = await ReadOnlyService().getGroups();
      } else {
        if (groupsResult.data != null) {
          final dynamic groupsDecrypted = await _scripts.decodeData(
            groupsResult.data!,
            aes,
          );
          result = List<Group>.from(
            groupsDecrypted.map((dynamic e) => Group.fromJson(e)),
          );
          await ReadOnlyService().addGroups(result);
        } else {
          result = [];
        }
      }

      onSuccess?.call(result);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Save list of passwords
  Future<void> savePasswords({
    required List<Password> passwords,
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      Encrypted? data;
      String hash;
      if (passwords.isNotEmpty) {
        final String aes = await _storage.load(_StorageKey.aes);
        data = await _scripts.encodeData(
          passwords.map((p) => p.toJson()).toList(),
          aes,
        );
        hash = await _scripts.hash(data);
      } else {
        data = null;
        hash = await _scripts.emptyHash();
      }
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.setEncryptedData(
        session,
        DataName.passwords,
        data,
        hash,
      );
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Save list of password groups
  Future<void> saveGroups({
    required List<Group> groups,
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      Encrypted? data;
      String hash;

      if (groups.isNotEmpty) {
        try {
          await ReadOnlyService().addGroups(groups);
        } catch (err) {
          dev.log('error from saving groups to local db in server adapter');
        }
        final String aes = await _storage.load(_StorageKey.aes);
        data = await _scripts.encodeData(
          groups.map((g) => g.toJson()).toList(),
          aes,
        );
        hash = await _scripts.hash(data);
      } else {
        data = null;
        hash = await _scripts.emptyHash();
      }
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.setEncryptedData(
        session,
        DataName.groups,
        data,
        hash,
      );
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load binary data of specific file
  Future<void> loadFile({
    required String fileId,
    Function(Uint8List)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final String aes = await _storage.load(_StorageKey.aes);
      final WebResult<Encrypted> result = await _web.getBinaryData(
        session,
        fileId,
      );
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call(await _scripts.decodeBinaryData(result.data!, aes));
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Load binary data of specific file shared by user
  Future<void> loadUserSharedFile({
    required String fileId,
    required int ownerId,
    required PCryptKey? publicKey,
    Function(Uint8List)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      // Load data from the server
      final String session = await _storage.load(_StorageKey.session);
      final WebResult<Encrypted> result = await _web.getUserSharedBinaryData(
        session,
        fileId,
        ownerId,
      );
      if (checkResultForErrors(result, onError)) {
        return;
      }
      // Decrypt loaded data
      final PCryptKey privateKey = PCryptKey.fromJson(
        jsonDecode(await _storage.load(_StorageKey.privateKey)),
      );
      final String sharedKey = await _scripts.getSharedKey(
        publicKey,
        privateKey,
      );
      final decodedBinary = await _scripts.decodeBinaryData(
        result.data!,
        sharedKey,
      );
      onSuccess?.call(decodedBinary);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Load binary data of specific file shared by user
  Future<void> loadTeamSharedFile({
    required String fileId,
    required int teamId,
    required String teamKey,
    Function(Uint8List)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      // Load data from the server
      final String session = await _storage.load(_StorageKey.session);
      final WebResult<Encrypted> result = await _web.getTeamSharedBinaryData(
        session,
        fileId,
        teamId,
      );
      if (checkResultForErrors(result, onError)) {
        return;
      }
      // Decrypt loaded data
      final decodedBinary = await _scripts.decodeBinaryData(
        result.data!,
        teamKey,
      );
      onSuccess?.call(decodedBinary);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Save file data to the server
  Future<void> saveFile({
    required String fileId,
    required Uint8List data,
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final String aes = await _storage.load(_StorageKey.aes);
      final encrypted = await _scripts.encodeBinaryData(data, aes);
      final result = await _web.setBinaryData(session, fileId, encrypted);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Remove file data from the server
  Future<void> deleteFiles({
    required List<String> fileIds,
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.removeBinaryData(session, fileIds);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load list of teams current user is a part of and all the members of these teams
  Future<void> loadTeamsAndMembers({
    bool excludeCurrentUser = false,
    bool checkSharingOptions = false,
    bool loadAvatars = false,
    Function(List<Team>, List<TeamMember>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);

      try {
        await getRemoteConfig(
          onSuccess: (config) async {
            if (config.disableTeams) {
              checkSharingOptions = false;
              excludeCurrentUser = false;
              onSuccess?.call([], []);
            } else {
              // Load list of teams
              List<Team>? teams;
              if (await Preferences().readonlyMode == true) {
                teams = await ReadOnlyService().getTeams();
              } else {
                final teamsResult = await _web.getTeamInfo(session);
                if (checkResultForErrors(teamsResult, onError)) {
                  return;
                }
                teams = teamsResult.data!;
                await ReadOnlyService().addTeams(teams);
              }

              // Load list of team members
              List<TeamMember> members;
              if (await Preferences().readonlyMode == true) {
                members = await ReadOnlyService().getTeamMembers();
              } else {
                final membersResult = await _web.getTeamMembers(session);
                if (checkResultForErrors(membersResult, onError)) {
                  return;
                }

                members = membersResult.data!;
                await ReadOnlyService().addTeamMember(members);
              }

              // Load list of team member avatars
              if (loadAvatars && await Preferences().readonlyMode != true) {
                final avatarsResult = await _web.getTeamMembersAvatars(session);
                if (checkResultForErrors(avatarsResult, onError)) {
                  return;
                }
                final avatars = avatarsResult.data!;
                for (var member in members) {
                  member.avatar = avatars.containsKey(member.userId)
                      ? avatars[member.userId]
                      : avatars[-1];
                }
              }

              // Filter teams and members

              int currentId;
              if (await Preferences().readonlyMode == true) {
                final user = await _readOnlyService.getUser();
                currentId = user!.id;
              } else {
                currentId = int.parse(await _storage.load(_StorageKey.userId));
              }

              if (checkSharingOptions) {
                teams = teams.where((t) {
                  final member = members.firstWhere(
                    (m) => m.userId == currentId && m.teamId == t.id,
                  );
                  return !member.userNoShare &&
                      (!member.teamOnlyAdminShare || member.isAdmin);
                }).toList();
                final teamIds = teams.map((t) => t.id).toSet();
                members = members
                    .where((m) => teamIds.contains(m.teamId))
                    .toList();
              }

              if (excludeCurrentUser) {
                members = members.where((m) => m.userId != currentId).toList();
              }
              onSuccess?.call(teams, members);
            }
          },
          onError: (error) {
            // do nothing
          },
        );
      } on Exception {
        // do nothing
      }
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Load list of passwords shared by other users
  Future<void> loadSharedPasswords({
    Function(List<Password>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    await loadTeamsAndMembers(
      onSuccess: (teamsList, membersList) async {
        try {
          final String session = await _storage.load(_StorageKey.session);
          try {
            await getRemoteConfig(
              onSuccess: (config) async {
                if (config.disableTeams) {
                  onSuccess?.call([]);
                  return;
                } else {
                  final sharesResult = await _web.getTeamShares(session);

                  if (checkResultForErrors(sharesResult, onError)) {
                    return;
                  }
                  final shares = sharesResult.data!;

                  // Load list of team shares
                  if (shares.isEmpty) {
                    onSuccess?.call([]);
                    return;
                  }
                  if (shares.isNotEmpty) {
                    // Load stored data

                    final String email = await _storage.load(_StorageKey.email);

                    final PCryptKey privateKey = PCryptKey.fromJson(
                      jsonDecode(await _storage.load(_StorageKey.privateKey)),
                    );
                    final String aes = await _storage.load(_StorageKey.aes);
                    final currentId = int.parse(
                      await _storage.load(_StorageKey.userId),
                    );
                    // Prepare teams and members arrays
                    final Map<int, Team?> teams = teamsList.asMap().map(
                      (k, v) => MapEntry(v.id, v),
                    );
                    final List<int> teamIds = teamsList
                        .map((t) => t.id)
                        .toList();
                    final List<TeamMember> members = membersList.where((
                      TeamMember m,
                    ) {
                      return m.userId != -1 &&
                          m.teamId != -1 &&
                          m.publicKey != null &&
                          teams.containsKey(m.teamId) &&
                          teams[m.teamId]?.isApproved == true;
                    }).toList();

                    // Get team keys
                    final teamKeys = await _scripts.getTeamKeys(
                      teamIds,
                      members,
                      currentId,
                      privateKey,
                      aes,
                    );
                    // Decrypt passwords
                    final passwords = await _scripts.decodeSharedPasswords(
                      shares,
                      teamKeys,
                      members,
                      privateKey,
                      email,
                      currentId,
                    );

                    // Combine passwords for user and team shares
                    final List<Password> allPasswords =
                        passwords.userSharedPasswords +
                        passwords.teamSharedPasswords;
                    // Indicate newly shared passwords
                    final currentPasswords = allPasswords
                        .where((password) => password.id != null)
                        .toList();

                    final List<String> currentPasswordIdsHashList =
                        await Future.wait<String>(
                          currentPasswords.map((Password password) async {
                            final hashData = '${password.id!}_${password.type}';
                            final hashPassId = await _scripts.stringHash(
                              hashData,
                            );
                            password.hashId = hashPassId;
                            return hashPassId;
                          }),
                        );

                    final sharedPrefPasswordIdsHashList = await _settings
                        .getStringList(Settings.kPasswordsPrefKey);
                    if (sharedPrefPasswordIdsHashList != null) {
                      final Map<String, List<Password>> hashAndPassword =
                          groupBy(
                            currentPasswords,
                            (Password obj) => obj.hashId!,
                          );
                      final sharedPrefPasswordSet = Set.of(
                        sharedPrefPasswordIdsHashList,
                      );
                      final currentPasswordIdsSet = Set.of(
                        currentPasswordIdsHashList,
                      );
                      final withoutDeletedPassIdsSet = sharedPrefPasswordSet
                          .intersection(currentPasswordIdsSet);
                      // Update sharedPreference when password was unshared
                      if (withoutDeletedPassIdsSet != sharedPrefPasswordSet) {
                        await _settings.saveStringList(
                          Settings.kPasswordsPrefKey,
                          withoutDeletedPassIdsSet.toList(),
                        );
                      }
                      final diffsAdd = currentPasswordIdsSet.difference(
                        sharedPrefPasswordSet,
                      );
                      for (var hash in diffsAdd) {
                        hashAndPassword[hash]?.first.isNewlyShared = true;
                      }
                    }
                    // Save to SharedPreference when first login
                    else {
                      await _settings.saveStringList(
                        Settings.kPasswordsPrefKey,
                        currentPasswordIdsHashList,
                      );
                    }
                    // Load icons
                    List<String>? iconResult = [];
                    if (await Preferences().readonlyMode != true) {
                      final icons = await _web.loadFaviconData(
                        session,
                        allPasswords.map((p) => p.url).toList(),
                      );

                      if (checkResultForErrors(icons, onError)) {
                        return;
                      }
                      iconResult = icons.data!;
                    }

                    for (int i = 0; i < allPasswords.length; i++) {
                      final password = allPasswords[i];
                      final creator = members.firstWhere(
                        (m) => m.userId == password.creator?.userId,
                      );
                      password.shareInfo = PasswordShareInfo(
                        username: creator.name,
                        email: creator.email,
                        teams: password.shareTeamIds
                            .map((t) => teams[t])
                            .where((t) => t != null)
                            .map((t) => t!)
                            .where(
                              (t) => members.any(
                                (m) =>
                                    m.userId == currentId && m.teamId == t.id,
                              ),
                            )
                            .map((t) => t.name)
                            .toList(),
                        type: password.type,
                      );

                      if (await Preferences().readonlyMode != true) {
                        password.icon = base64Decode(iconResult[i]);
                      }

                      for (TeamMember member in members.where(
                        (m) =>
                            m.userId == (password.creator?.userId ?? -2) &&
                            password.shareTeamIds.contains(m.teamId),
                      )) {
                        final currentMember = members.firstWhere(
                          (m) =>
                              m.userId == currentId &&
                              m.teamId == member.teamId,
                        );
                        password.isHidden |=
                            currentMember.teamHidePassword ||
                            currentMember.userHidePassword;
                      }
                    }
                    onSuccess?.call(allPasswords);
                  } else {
                    onSuccess?.call([]);
                  }
                }
              },
              onError: (error) {
                // do nothing
              },
            );
          } on Exception {
            // do nothing
          }
        } catch (error) {
          onError?.call(AdapterError.fromException(error));
        }
      },
      onError: (error) {
        onError?.call(error);
      },
    );
  }

  Future<void> getGlobalEmergencyStatus({
    Function(bool)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.globalEmergencyStatus(session);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call(result.data!);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  Future<void> getGlobalEmergencySetup(
    String password, {
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.globalEmergencySetup(session);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      final privateKey = PCryptKey.fromJson(
        jsonDecode(await _storage.load(_StorageKey.privateKey)),
      );
      final resultData = result.data ?? <String, dynamic>{};
      final dataForSetEmergency = <String, dynamic>{};
      if (resultData.isNotEmpty) {
        final uidMap = resultData['uid'] as Map<String, dynamic>?;
        if (uidMap != null) {
          for (final entry in uidMap.entries) {
            final dynamic value = entry.value;
            final publicKeyJson = value['publickey'] as Map<String, dynamic>?;
            final publicKey = PCryptKey.fromJson(
              publicKeyJson ?? <String, dynamic>{},
            );
            final String sharedKey = await _scripts.getSharedKey(
              publicKey,
              privateKey,
            );
            final encryptedPassword = await _scripts.encodeData(
              password,
              sharedKey,
            );
            dataForSetEmergency[entry.key] = jsonEncode(
              encryptedPassword.toJson(),
            );
          }
        }
      }

      // second API call
      final setEmergencyResult = await _web.globalSetEmergency(
        session,
        <String, dynamic>{'passobject': dataForSetEmergency},
      );
      if (checkResultForErrors(setEmergencyResult, onError)) {
        if (kDebugMode) {
          print(
            'globalSetEmergency error ${setEmergencyResult.error?.message}',
          );
        }
        return;
      }

      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  ///Create new team
  Future<void> createTeam({
    required String name,
    required String contact,
    required String email,
    Function(TeamMemberIdPair)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.createTeam(session, name, contact, email);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call(result.data!);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Share specified passwords with specified members
  Future<void> sharePasswords({
    required List<Password> passwordsToShare,
    required List<Password> myPasswords,
    required List<TeamMember> toMembers,
    Function(List<Password>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    await loadTeamsAndMembers(
      onSuccess: (allTeams, allMembers) async {
        try {
          final String session = await _storage.load(_StorageKey.session);
          final currentId = int.parse(await _storage.load(_StorageKey.userId));
          final PCryptKey privateKey = PCryptKey.fromJson(
            jsonDecode(await _storage.load(_StorageKey.privateKey)),
          );
          final String aes = await _storage.load(_StorageKey.aes);
          // Copy passwords
          final List<Password> copiedPasswords = myPasswords.map<Password>((p) {
            return p.copyWith(
              shares: Map.from(
                p.shares.map<int, List<int>>(
                  (int k, List<int> v) => MapEntry(k, List.from(v)),
                ),
              ),
              shareChanges: Map.from(
                p.shareChanges.map<int, List<int>>((k, v) => MapEntry(k, v)),
              ),
            );
          }).toList();
          // Prepare share data
          final List<Password> toShare = <Password>[];
          final List<Password> changedPasswords = <Password>[];
          bool fileChanges = false;
          for (Password password in copiedPasswords) {
            final needsToBeShared = passwordsToShare.any(
              (p) => p.tempId == password.tempId,
            );
            if (needsToBeShared) {
              final oldShares = Map<int, List<int>>.from(
                password.shares.map<int, List<int>>(
                  (int k, List<int> v) => MapEntry(k, List.from(v)),
                ),
              );
              final copiedPassword = password.copyWith(shares: {});
              for (TeamMember member in toMembers) {
                if (copiedPassword.shares.containsKey(member.userId)) {
                  if (copiedPassword.shares[member.userId]?.contains(
                        member.teamId,
                      ) ==
                      false) {
                    copiedPassword.shares[member.userId]!.add(member.teamId);
                  }
                } else {
                  copiedPassword.shares.putIfAbsent(
                    member.userId,
                    () => [member.teamId],
                  );
                }
              }

              final newShares = copiedPassword.shares;
              final findShareChanges = await _scripts.findShareChanges(
                oldShares,
                newShares,
              );
              copiedPassword.shareChanges = findShareChanges;
              changedPasswords.add(copiedPassword);
              toShare.add(copiedPassword);
            } else {
              toShare.add(password);
            }

            if (needsToBeShared && !fileChanges) {
              fileChanges = password.files.isNotEmpty;
            }
          }

          // Load team binary info
          Map<String, dynamic> serverFileData = <String, dynamic>{};
          if (fileChanges) {
            final result = await _web.getTeamBinaryInfoV2(session);
            if (checkResultForErrors(result, onError)) {
              return;
            }
            serverFileData = result.data ?? <String, dynamic>{};
          }

          //Get share data (part 1)
          final Share1Result share1 = await _scripts.sharePasswordsPart1(
            toShare,
            allMembers,
            serverFileData,
            currentId,
            fileChanges,
          );
          //Load binary data (for new files)
          final newBinaryResult = await _web.getBinaryDataList(
            session,
            share1.newFileIds,
          );
          if (checkResultForErrors(newBinaryResult, onError)) {
            return;
          }

          // Prepare teams and members arrays
          final Map<int, Team?> teams = allTeams.asMap().map(
            (k, v) => MapEntry(v.id, v),
          );
          final List<int> teamIds = allTeams.map((t) => t.id).toList();
          final List<TeamMember> filteredMembers = allMembers.where((
            TeamMember m,
          ) {
            return m.userId != -1 &&
                m.teamId != -1 &&
                m.publicKey != null &&
                teams.containsKey(m.teamId) &&
                teams[m.teamId]?.isApproved == true;
          }).toList();
          Map<int, Map<int, String>> teamKeys = {};
          if (teamIds.isNotEmpty) {
            // Get team keys
            teamKeys = await _scripts.getTeamKeys(
              teamIds,
              filteredMembers,
              currentId,
              privateKey,
              aes,
            );
          }
          //Get share data (part 2)
          final Share2ResultV2 share2 = await _scripts.sharePasswordsPart2(
            share1,
            newBinaryResult.data!,
            allMembers,
            serverFileData,
            privateKey,
            currentId,
            fileChanges,
            teamKeys,
          );

          //Re-encrypt shared files
          final binaryDataDecrypted = <String, Uint8List>{};
          for (var e in newBinaryResult.data!.entries) {
            final data = await _scripts.decodeBinaryData(e.value, aes);
            binaryDataDecrypted.putIfAbsent(e.key, () => data);
          }
          for (var fs in share2.newUserFiles ?? <UserFileShare>[]) {
            fs.data = await _scripts.encodeBinaryData(
              binaryDataDecrypted[fs.fileId] ?? Uint8List(0),
              fs.shareKey,
            );
          }
          for (var fs in share2.newTeamFiles ?? <TeamFileShare>[]) {
            fs.data = await _scripts.encodeBinaryData(
              binaryDataDecrypted[fs.fileId] ?? Uint8List(0),
              fs.shareKey,
            );
          }

          //Save share data (passwords)
          if (share2.noDelTeamSource != null) {
            //teams
            final shareTeamResult = await _web.setTeamShares(
              session,
              share2.teamDataString,
              share2.teamHash,
            );
            if (checkResultForErrors(shareTeamResult, onError)) {
              return;
            }
          }
          //members
          final shareMemberResult = await _web.setMemberShares(
            session,
            share2.userDataString,
            share2.userHash,
          );
          if (checkResultForErrors(shareMemberResult, onError)) {
            return;
          }

          //Save share data (files)
          if (share2.newUserFiles != null && share2.newUserFiles!.isNotEmpty) {
            //members
            final shareBinaryMembersResult = await _web.setMemberBinary(
              session,
              share2.newUserFiles!,
              share2.noDelUserSource!,
            );
            if (checkResultForErrors(shareBinaryMembersResult, onError)) {
              return;
            }
          }
          if (share2.newTeamFiles != null && share2.newTeamFiles!.isNotEmpty) {
            //teams
            final shareBinaryResult = await _web.setTeamBinary(
              session,
              share2.newTeamFiles!,
              share2.noDelTeamSource!,
            );
            if (checkResultForErrors(shareBinaryResult, onError)) {
              return;
            }
          }
          //Remove share changes
          for (var p in changedPasswords) {
            p.shareChanges.clear();
          }
          onSuccess?.call(changedPasswords);
        } catch (error) {
          onError?.call(AdapterError.fromException(error));
        }
      },
      onError: (error) {
        onError?.call(error);
      },
    );
  }

  /// Re-share specified passwords with whomever they were previously shared with
  Future<void> updateSharedPasswords({
    required Password passwordToUpdate,
    required List<Password> myPasswords,
    Function(List<Password>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    await loadTeamsAndMembers(
      onSuccess: (allTeams, allMembers) async {
        try {
          final String session = await _storage.load(_StorageKey.session);
          final currentId = int.parse(await _storage.load(_StorageKey.userId));
          final PCryptKey privateKey = PCryptKey.fromJson(
            jsonDecode(await _storage.load(_StorageKey.privateKey)),
          );
          final String aes = await _storage.load(_StorageKey.aes);

          // Copy passwords
          final List<Password> copiedPasswords = myPasswords.map<Password>((p) {
            return p.copyWith(
              shares: Map.from(
                p.shares.map<int, List<int>>(
                  (int k, List<int> v) => MapEntry(k, List.from(v)),
                ),
              ),
              shareChanges: Map.from(
                p.shareChanges.map<int, List<int>>((k, v) => MapEntry(k, v)),
              ),
            );
          }).toList();

          // Prepare share data
          final List<Password> toShare = <Password>[];
          final List<Password> changedPasswords = <Password>[];
          bool fileChanges = false;
          for (Password password in copiedPasswords) {
            final needsToBeShared = passwordToUpdate.tempId == password.tempId;
            if (needsToBeShared) {
              final newShares = passwordToUpdate.shares;
              final findShareChanges = await _scripts.findShareChanges(
                {},
                newShares,
              );
              passwordToUpdate.shareChanges = findShareChanges;
              changedPasswords.add(passwordToUpdate);
              toShare.add(passwordToUpdate);
            } else {
              toShare.add(password);
            }
            if (needsToBeShared && !fileChanges) {
              fileChanges = password.files.isNotEmpty;
            }
          }

          // Load team binary info
          Map<String, dynamic> serverFileData = <String, dynamic>{};
          if (fileChanges) {
            final result = await _web.getTeamBinaryInfoV2(session);
            if (checkResultForErrors(result, onError)) {
              return;
            }
            serverFileData = result.data ?? <String, dynamic>{};
          }

          //Get share data (part 1)
          final Share1Result share1 = await _scripts.sharePasswordsPart1(
            toShare,
            allMembers,
            serverFileData,
            currentId,
            fileChanges,
          );
          //Load binary data (for new files)
          final newBinaryResult = await _web.getBinaryDataList(
            session,
            share1.newFileIds,
          );
          if (checkResultForErrors(newBinaryResult, onError)) {
            return;
          }

          // Prepare teams and members arrays
          final Map<int, Team?> teams = allTeams.asMap().map(
            (k, v) => MapEntry(v.id, v),
          );
          final List<int> teamIds = allTeams.map((t) => t.id).toList();
          final List<TeamMember> filteredMembers = allMembers.where((
            TeamMember m,
          ) {
            return m.userId != -1 &&
                m.teamId != -1 &&
                m.publicKey != null &&
                teams.containsKey(m.teamId) &&
                teams[m.teamId]?.isApproved == true;
          }).toList();
          Map<int, Map<int, String>> teamKeys = {};
          if (teamIds.isNotEmpty) {
            // Get team keys
            teamKeys = await _scripts.getTeamKeys(
              teamIds,
              filteredMembers,
              currentId,
              privateKey,
              aes,
            );
          }

          //Get share data (part 2)
          final Share2ResultV2 share2 = await _scripts.sharePasswordsPart2(
            share1,
            newBinaryResult.data!,
            allMembers,
            serverFileData,
            privateKey,
            currentId,
            fileChanges,
            teamKeys,
          );

          //Re-encrypt shared files
          final binaryDataDecrypted = <String, Uint8List>{};
          for (var e in newBinaryResult.data!.entries) {
            final data = await _scripts.decodeBinaryData(e.value, aes);
            binaryDataDecrypted.putIfAbsent(e.key, () => data);
          }
          for (var fs in share2.newUserFiles ?? <UserFileShare>[]) {
            fs.data = await _scripts.encodeBinaryData(
              binaryDataDecrypted[fs.fileId] ?? Uint8List(0),
              fs.shareKey,
            );
          }
          for (var fs in share2.newTeamFiles ?? <TeamFileShare>[]) {
            fs.data = await _scripts.encodeBinaryData(
              binaryDataDecrypted[fs.fileId] ?? Uint8List(0),
              fs.shareKey,
            );
          }

          //Save share data (passwords)
          if (share2.noDelTeamSource != null) {
            //teams
            final shareTeamResult = await _web.setTeamShares(
              session,
              share2.teamDataString,
              share2.teamHash,
            );
            if (checkResultForErrors(shareTeamResult, onError)) {
              return;
            }
          }
          //members
          final shareMemberResult = await _web.setMemberShares(
            session,
            share2.userDataString,
            share2.userHash,
          );
          if (checkResultForErrors(shareMemberResult, onError)) {
            return;
          }

          //Save share data (files)
          if (share2.newUserFiles != null && share2.newUserFiles!.isNotEmpty) {
            //members
            final shareBinaryMembersResult = await _web.setMemberBinary(
              session,
              share2.newUserFiles!,
              share2.noDelUserSource!,
            );
            if (checkResultForErrors(shareBinaryMembersResult, onError)) {
              return;
            }
          }
          if (share2.newTeamFiles != null && share2.newTeamFiles!.isNotEmpty) {
            //teams
            final shareBinaryResult = await _web.setTeamBinary(
              session,
              share2.newTeamFiles!,
              share2.noDelTeamSource!,
            );
            if (checkResultForErrors(shareBinaryResult, onError)) {
              return;
            }
          }

          //Remove share changes
          for (var p in changedPasswords) {
            p.shareChanges.clear();
          }
          onSuccess?.call(changedPasswords);
        } catch (error) {
          onError?.call(AdapterError.fromException(error));
        }
      },
      onError: (error) {
        onError?.call(error);
      },
    );
  }

  /// Un-share specified passwords with whomever they were previously shared with
  Future<void> deleteSharedPasswords({
    required List<Password> passwordsToDelete,
    required List<Password> myPasswords,
    Function(List<Password>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    await loadTeamsAndMembers(
      onSuccess: (allTeams, allMembers) async {
        try {
          final String session = await _storage.load(_StorageKey.session);
          final currentId = int.parse(await _storage.load(_StorageKey.userId));
          final PCryptKey privateKey = PCryptKey.fromJson(
            jsonDecode(await _storage.load(_StorageKey.privateKey)),
          );
          final String aes = await _storage.load(_StorageKey.aes);

          // Copy passwords
          final allPasswords = myPasswords + passwordsToDelete;
          final List<Password> copiedPasswords = allPasswords.map<Password>((
            p,
          ) {
            return p.copyWith(
              shares: Map.from(
                p.shares.map<int, List<int>>(
                  (int k, List<int> v) => MapEntry(k, List.from(v)),
                ),
              ),
              shareChanges: Map.from(
                p.shareChanges.map<int, List<int>>((k, v) => MapEntry(k, v)),
              ),
            );
          }).toList();

          // Prepare share data
          final List<Password> toShare = <Password>[];
          final List<Password> changedPasswords = <Password>[];
          bool fileChanges = false;
          for (Password password in copiedPasswords) {
            final needsToBeShared = passwordsToDelete.any(
              (p) => p.tempId == password.tempId,
            );
            if (needsToBeShared) {
              final oldShares = Map<int, List<int>>.from(
                password.shares.map<int, List<int>>(
                  (int k, List<int> v) => MapEntry(k, List.from(v)),
                ),
              );
              final copiedPassword = password.copyWith(shares: {});
              final newShares = copiedPassword.shares;
              final findShareChanges = await _scripts.findShareChanges(
                oldShares,
                newShares,
              );
              copiedPassword.shareChanges = findShareChanges;
              changedPasswords.add(copiedPassword);
              toShare.add(copiedPassword);
            } else {
              toShare.add(password);
            }

            if (needsToBeShared && !fileChanges) {
              fileChanges = password.files.isNotEmpty;
            }
          }

          // Load team binary info
          Map<String, dynamic> serverFileData = <String, dynamic>{};
          if (fileChanges) {
            final result = await _web.getTeamBinaryInfoV2(session);
            if (checkResultForErrors(result, onError)) {
              return;
            }
            serverFileData = result.data ?? <String, dynamic>{};
          }

          //Get share data (part 1)
          final Share1Result share1 = await _scripts.sharePasswordsPart1(
            toShare,
            allMembers,
            serverFileData,
            currentId,
            fileChanges,
          );
          //Load binary data (for new files)
          final newBinaryResult = await _web.getBinaryDataList(
            session,
            share1.newFileIds,
          );
          if (checkResultForErrors(newBinaryResult, onError)) {
            return;
          }

          // Prepare teams and members arrays
          final Map<int, Team?> teams = allTeams.asMap().map(
            (k, v) => MapEntry(v.id, v),
          );
          final List<int> teamIds = allTeams.map((t) => t.id).toList();
          final List<TeamMember> filteredMembers = allMembers.where((
            TeamMember m,
          ) {
            return m.userId != -1 &&
                m.teamId != -1 &&
                m.publicKey != null &&
                teams.containsKey(m.teamId) &&
                teams[m.teamId]?.isApproved == true;
          }).toList();
          Map<int, Map<int, String>> teamKeys = {};
          if (teamIds.isNotEmpty) {
            // Get team keys
            teamKeys = await _scripts.getTeamKeys(
              teamIds,
              filteredMembers,
              currentId,
              privateKey,
              aes,
            );
          }

          //Get share data (part 2)
          final Share2ResultV2 share2 = await _scripts.sharePasswordsPart2(
            share1,
            newBinaryResult.data!,
            allMembers,
            serverFileData,
            privateKey,
            currentId,
            fileChanges,
            teamKeys,
          );

          //Re-encrypt shared files
          final binaryDataDecrypted = <String, Uint8List>{};
          for (var e in newBinaryResult.data!.entries) {
            final data = await _scripts.decodeBinaryData(e.value, aes);
            binaryDataDecrypted.putIfAbsent(e.key, () => data);
          }
          for (var fs in share2.newUserFiles ?? <UserFileShare>[]) {
            fs.data = await _scripts.encodeBinaryData(
              binaryDataDecrypted[fs.fileId] ?? Uint8List(0),
              fs.shareKey,
            );
          }
          for (var fs in share2.newTeamFiles ?? <TeamFileShare>[]) {
            fs.data = await _scripts.encodeBinaryData(
              binaryDataDecrypted[fs.fileId] ?? Uint8List(0),
              fs.shareKey,
            );
          }

          //Save share data (passwords)
          if (share2.noDelTeamSource != null) {
            //teams
            final shareTeamResult = await _web.setTeamShares(
              session,
              share2.teamDataString,
              share2.teamHash,
            );
            if (checkResultForErrors(shareTeamResult, onError)) {
              return;
            }
          }
          //members
          final shareMemberResult = await _web.setMemberShares(
            session,
            share2.userDataString,
            share2.userHash,
          );
          if (checkResultForErrors(shareMemberResult, onError)) {
            return;
          }

          //Save share data (files)
          if (share2.newUserFiles != null && share2.newUserFiles!.isNotEmpty) {
            //members
            final shareBinaryMembersResult = await _web.setMemberBinary(
              session,
              share2.newUserFiles!,
              share2.noDelUserSource!,
            );
            if (checkResultForErrors(shareBinaryMembersResult, onError)) {
              return;
            }
          }
          if (share2.newTeamFiles != null && share2.newTeamFiles!.isNotEmpty) {
            //teams
            final shareBinaryResult = await _web.setTeamBinary(
              session,
              share2.newTeamFiles!,
              share2.noDelTeamSource!,
            );
            if (checkResultForErrors(shareBinaryResult, onError)) {
              return;
            }
          }

          //Remove share changes
          for (var p in myPasswords) {
            p.shareChanges.clear();
          }
          onSuccess?.call(myPasswords);
        } catch (error) {
          onError?.call(AdapterError.fromException(error));
        }
      },
      onError: (error) {
        onError?.call(error);
      },
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Add new users specified by emails and return processed user data as well as unprocessable emails list
  Future<void> processNewTeamMembers({
    required List<TeamMember> members,
    Function(List<TeamMember>, List<String>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final session = await _storage.load(_StorageKey.session);
      final email = await _storage.load(_StorageKey.email);
      final preparedMembers = members.where((m) => m.email != email).toList();
      //Add new members
      final addResult = await _web.addNewTeamMembers(
        session,
        preparedMembers,
        Localization.get.currentLanguage,
      );
      if (checkResultForErrors(addResult, onError)) {
        return;
      }
      //Load added members
      final getResult = await _web.getTeamMembers(session);
      if (checkResultForErrors(getResult, onError)) {
        return;
      }
      //Merge members
      final mergedMembers = preparedMembers
          .map<TeamMember>((m) {
            final findings = getResult.data!.where(
              (pm) => pm.email == m.email && pm.teamId == m.teamId,
            );
            return findings.isNotEmpty ? findings.first : m;
          })
          .where((m) => m.userId != -1)
          .toList();
      final newEmails = preparedMembers
          .map((m) => m.email)
          .where((e) => !mergedMembers.any((m) => m.email == e))
          .toList();
      onSuccess?.call(mergedMembers, newEmails);
    } catch (error) {
      dev.log("$error");
      onError?.call(AdapterError.fromException(error));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load list of incoming and outgoing messages
  Future<void> loadMessages({
    Function(List<Message>, List<Message>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    await loadTeamsAndMembers(
      loadAvatars: true,
      onSuccess: (teamsList, membersList) async {
        try {
          final Map<int, Team> teams = teamsList.asMap().map(
            (k, v) => MapEntry(v.id, v),
          );
          final Map<int, TeamMember> members = membersList
              .where((m) {
                return m.userId != -1 &&
                    m.teamId != -1 &&
                    m.publicKey != null &&
                    teams.containsKey(m.teamId) &&
                    teams[m.teamId]?.isApproved == true;
              })
              .toList()
              .asMap()
              .map((k, v) => MapEntry(v.userId, v));
          final session = await _storage.load(_StorageKey.session);
          final aes = await _storage.load(_StorageKey.aes);
          final privateKey = PCryptKey.fromJson(
            jsonDecode(await _storage.load(_StorageKey.privateKey)),
          );
          //Load and decrypt messages
          final messagesResult = await _web.loadMessages(session);
          if (checkResultForErrors(messagesResult, onError)) {
            return;
          }
          //Decrypt Inbox messages
          final inbox = <Message>[];
          for (final MessageEncrypted message
              in messagesResult.data![MessagesBox.inbox] ??
                  <MessageEncrypted>[]) {
            final member = members[message.remoteId];
            if (member != null && member.publicKey != null) {
              try {
                final sharedKey = await _scripts.getSharedKey(
                  member.publicKey!,
                  privateKey,
                );
                inbox.add(
                  Message.fromJson(
                    await _scripts.decodeData(message.data, sharedKey),
                    message,
                    teams[member.teamId]!,
                    member,
                  ),
                );
              } catch (error) {
                //TODO maybe do something
              }
            }
          }
          //Decrypt Outbox messages
          final outbox = <Message>[];
          for (final MessageEncrypted message
              in messagesResult.data![MessagesBox.outbox] ??
                  <MessageEncrypted>[]) {
            final member = members[message.remoteId];
            if (member != null) {
              try {
                outbox.add(
                  Message.fromJson(
                    await _scripts.decodeData(message.data, aes),
                    message,
                    teams[member.teamId]!,
                    member,
                  ),
                );
              } catch (error) {
                //TODO maybe do something
              }
            }
          }
          onSuccess?.call(inbox, outbox);
        } catch (error) {
          onError?.call(AdapterError.fromException(error));
        }
      },
      onError: (error) {
        onError?.call(error);
      },
    );
  }

  /// Send message
  Future<void> sendMessage({
    required MessageInfo messageInfo,
    Function(List<Message>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    await loadTeamsAndMembers(
      onSuccess: (teamsList, membersList) async {
        try {
          final currentId = int.parse(await _storage.load(_StorageKey.userId));
          final membersToShare = groupBy(
            membersList,
            (TeamMember e) => e.userId,
          );
          final allMembersToShare = messageInfo.userIds.map((e) {
            return membersToShare[e] ?? [];
          });

          final teamMembers = groupBy(
            membersList.where((element) => element.userId != currentId),
            (TeamMember e) => e.teamId,
          );
          final teamMembersToShare = messageInfo.teamIds.map((e) {
            return teamMembers[e] ?? [];
          }).flattened;

          final membersFromTeams = groupBy(
            teamMembersToShare,
            (TeamMember e) => e.userId,
          ).values;
          final teamsAndMembers = [
            ...allMembersToShare,
            ...membersFromTeams,
          ].flattened.toSet();
          final sharesFrom =
              groupBy(
                teamsAndMembers,
                (TeamMember e) => e.userId,
              ).map<int, List<int>>((int k, List<TeamMember> v) {
                return MapEntry(k, v.map((e) => e.teamId).toList());
              });

          final String session = await _storage.load(_StorageKey.session);
          final String aes = await _storage.load(_StorageKey.aes);
          final PCryptKey privateKey = PCryptKey.fromJson(
            jsonDecode(await _storage.load(_StorageKey.privateKey)),
          );

          //Encrypt 'from' data
          final myTeamId = membersList
              .firstWhere((element) => element.userId == currentId)
              .teamId;
          final messageToSendFrom = MessageToSend(
            subject: messageInfo.subject,
            message: messageInfo.message,
            teamId: myTeamId,
            shares: sharesFrom,
            createdAt: DateTime.now(),
          );
          final Encrypted fromData = await _scripts.encodeData(
            messageToSendFrom.toJson(),
            aes,
          );

          //Encrypt 'to' data
          final toData = <int, Encrypted>{};
          for (TeamMember member in teamsAndMembers) {
            if (member.publicKey != null) {
              final sharedKey = await _scripts.getSharedKey(
                member.publicKey!,
                privateKey,
              );
              final messageToSendTo = MessageToSend(
                subject: messageInfo.subject,
                message: messageInfo.message,
                teamId: member.teamId,
                shares: sharesFrom,
                createdAt: DateTime.now(),
              );
              final result = await _scripts.encodeData(
                messageToSendTo.toJson(),
                sharedKey,
              );
              toData[member.userId] = result;
            }
          }

          //Send data to the server
          final sendResult = await _web.sendMessage(
            session,
            fromData,
            toData,
            Localization.get.currentLanguage,
          );
          if (checkResultForErrors(sendResult, onError)) {
            return;
          }
          //Populate resulting messages
          final List<Message> messages = teamsAndMembers.map<Message>((m) {
            return Message(
              mailId: sendResult.data![m.userId] ?? -1,
              subject: messageToSendFrom.subject,
              message: messageToSendFrom.message,
              remoteMember: m,
              shares: messageToSendFrom.shares,
              createdAt: messageToSendFrom.createdAt,
              isRead: false,
            );
          }).toList();
          onSuccess?.call(messages);
        } catch (error) {
          onError?.call(AdapterError.fromException(error));
        }
      },
      onError: (error) {
        onError?.call(error);
      },
    );
  }

  /// Delete specific messages
  Future<void> deleteMessages({
    required List<Message> messages,
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final session = await _storage.load(_StorageKey.session);
      if (messages.isNotEmpty) {
        final deleteResult = await _web.deleteMessages(session, messages);
        if (checkResultForErrors(deleteResult, onError)) {
          return;
        }
      }
      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Update info of current user and save it to the server
  Future<void> updateUserInfo({
    required User user,
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.updateUserInfo(session, user);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      await _storage.save(_StorageKey.userId, user.id.toString());
      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Check whether user has any updated data
  Future<void> getUserUpdates({
    Function(UserUpdates)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      ///WHEN READONLY  MODE IS NOT ACTIVE, THE APP CAN FETCH FOR  UPDATES FROM
      ///THE  SERVER.
      if (await Preferences().readonlyMode != true) {
        final String session = await _storage.load(_StorageKey.session);

        final result = await _web.getUserUpdates(session);

        if (checkResultForErrors(result, onError)) {
          return;
        }
        onSuccess?.call(result.data!);
      }
    } catch (error) {
      final err = AdapterError.fromException(error);
      onError?.call(err);
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load the number of global messages
  Future<void> getGlobalMessagesCount({
    Function(int)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.getGlobalMessagesCount(session);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call(result.data!);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Reset the number of global messages
  Future<void> resetGlobalMessagesCount({
    Function()? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      final result = await _web.resetGlobalMessagesCount(session);
      if (checkResultForErrors(result, onError)) {
        return;
      }
      onSuccess?.call();
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  /// Load the number of global messages
  Future<void> loadGlobalMessages({
    Function(List<GlobalMessage>)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    try {
      final String session = await _storage.load(_StorageKey.session);
      List<GlobalMessage> messages;
      if (await Preferences().readonlyMode == true) {
        ///TODO: IMPLEMENT LOCAL MESSAGES LATER
        messages = [];
      } else {
        final result = await _web.loadGlobalMessages(session);
        if (checkResultForErrors(result, onError)) {
          return;
        }

        messages = result.data!;
      }

      onSuccess?.call(messages);
    } catch (error) {
      onError?.call(AdapterError.fromException(error));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Get URL which is used to view locations on the map
  Future<String> getLocationViewerUrl(
    Iterable<Location> locations, {
    Location? currentLocation,
  }) async {
    final auth = await _storage.load(_StorageKey.auth);
    return _web.locationViewerUrl(auth, locations, currentLocation);
  }

  /// Get Location from address string
  Future<Location?> getLocationFromAddress(String address) async {
    try {
      final auth = await _storage.load(_StorageKey.auth);
      final WebResult<GeocodeResult> result = await _web.locationFromAddress(
        auth,
        address,
      );
      if (result.data != null) {
        final geometry = result.data!.geometry;
        double distance;
        switch (geometry.locationType) {
          case GeocodeLocationType.rooftop:
            distance = 50;
            break;
          case GeocodeLocationType.approximate:
            final lat1 =
                geometry.boundsNorthEast?.latitude ??
                geometry.viewportNorthEast.latitude;
            final lng1 =
                geometry.boundsNorthEast?.longitude ??
                geometry.viewportNorthEast.longitude;
            final lat2 =
                geometry.boundsSouthWest?.latitude ??
                geometry.viewportSouthWest.latitude;
            final lng2 =
                geometry.boundsSouthWest?.longitude ??
                geometry.viewportSouthWest.longitude;
            distance =
                LocationService.get.calculateDistance(lat1, lng1, lat2, lng2) /
                2;
            break;
          // default:
          //   distance = 200;
          //   break;
        }
        return Location(
          title: result.data!.formattedAddress,
          latitude: geometry.location.latitude,
          longitude: geometry.location.longitude,
          accuracy: distance.floor(),
        );
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  ///Get app configuration
  Future<void> getRemoteConfig({
    Function(RemoteConfiguration)? onSuccess,
    Function(AdapterError)? onError,
  }) async {
    final rawCachedConfig = await _storage.load(_StorageKey.remoteConfig);
    if (rawCachedConfig.isNotEmpty) {
      try {
        Future.delayed(Duration.zero, () {
          final cachedConfig = RemoteConfiguration.fromJson(
            jsonDecode(rawCachedConfig),
          );
          onSuccess?.call(cachedConfig);
        });
      } on Exception {
        // _storage.remove(_StorageKey.remoteConfig);
      }
    }

    final configResults = await _web.getRemoteConfig();

    if (checkResultForErrors(configResults, onError)) {
      return;
    } else {
      _storage.save(
        _StorageKey.remoteConfig,
        jsonEncode(configResults.data!.toJson()),
      );
    }

    onSuccess?.call(configResults.data!);
  }

  /// Clears previously cached app configuration
  Future<void> cleanRemoteConfig() async {
    return _storage.remove(_StorageKey.remoteConfig);
  }

  ///REMOVE USER ACCOUNT
  Future<WebResult> removeAccount({
    required String email,
    required String password,
  }) async {
    try {
      final WebResult<Login1Result> result1 = await _web.loginStep1(email);
      if (result1.hasError) {
        return WebResult.error(8, result1.error?.message ?? '');
      }

      final String aes = await _storage.load(_StorageKey.aes);

      final LoginKeys keys = await _scripts.loginStep1Part1(
        result1.data!,
        password,
      );

      if (keys.aes != aes) {
        return WebResult.error(16, Strings.loginErrorInvalidPassword);
      }

      final String session = await _storage.load(_StorageKey.session);
      await _web.deleteAccount(session, email);

      return WebResult.success('An email has been sent to your account.');
    } catch (err) {
      if (kDebugMode) {
        dev.log('error from removeAccount() in server adapter: $err');
      }

      return WebResult.error(11, err.toString());
    }
  }
}

//======================================================================================================================

/// Constants to use with methods of the [_SecureStorage] class
enum _StorageKey { session, auth, aes, email, privateKey, userId, remoteConfig }

/// String names for [_StorageKey] constants
final _storageKeyNames = <_StorageKey, String>{
  _StorageKey.session: 'session',
  _StorageKey.aes: 'aes',
  _StorageKey.auth: 'auth',
  _StorageKey.email: 'email',
  _StorageKey.privateKey: 'privateKey',
  _StorageKey.userId: 'userId',
  _StorageKey.remoteConfig: 'remoteConfigs',
};

/// Secure storage for storing key-value pairs (records)
///
/// Class is a singleton. Use static [get] method to get access to its (only) instance.
/// Keys are defined by [_StorageKey] constants. Values are always [String] (may be *null*).
/// Passing *null* as value will remove respective record from the storage.
/// Reading non-existing record will return *null* as result
class _SecureStorage {
  _SecureStorage._();

  static final _SecureStorage get = _SecureStorage._();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  /// Save (or remove) value to the storage
  Future<void> save(_StorageKey key, String? value) async {
    final name = _storageKeyNames[key];
    if (name != null) {
      if (value != null) {
        await _storage.write(key: name, value: value);
      } else {
        await _storage.delete(key: name);
      }
    }
  }

  /// Remove value from the storage
  ///
  /// Shortcut for [save] method where value is *null*
  Future<void> remove(_StorageKey key) async {
    final name = _storageKeyNames[key];
    if (name != null) {
      await _storage.delete(key: name);
    }
  }

  /// Check whether value is contained in storage
  ///
  /// Shortcut for using [load] and check result for *null*
  Future<bool> check(_StorageKey key) async {
    final name = _storageKeyNames[key];
    if (name != null) {
      return (await _storage.read(key: name)) != null;
    }
    return false;
  }

  /// Load value from the storage (if present)
  Future<String> load(_StorageKey key) async {
    final name = _storageKeyNames[key];
    if (name != null) {
      return await _storage.read(key: name) ?? '';
    }
    return '';
  }
}

//======================================================================================================================

/// Various errors that may occur during server interaction
/// Returned by [onError] callback of operation methods of [ServerAdapter] class
///
/// [isSessionExpired] returns [true] if operation failed due to login token being invalid
/// [isUnknownUser] returns [true] if invalid user name (email) specified during login
/// [isInvalidPassword] returns [true] if invalid password specified during login
/// [isEmailNotVerified] returns [true] is email verification is needed before executing the operation
/// [isPremiumFeature] returns [true] if operation is only available to premium accounts
/// [message] Field describes (unlocalized) error message
class AdapterError {
  AdapterError._(this._code, this.message);

  factory AdapterError.fromWebError(WebError error) =>
      AdapterError._(error.code, error.message);

  factory AdapterError.fromException(Object exception) =>
      AdapterError._(0, exception.toString());

  factory AdapterError.sessionExpired() => AdapterError._(14, '');

  bool get isSessionExpired => _code == 14;

  bool get isAccountExists => _code == 6;

  bool get isUnknownUser => _code == 7;

  bool get isInvalidPassword => _code == 16 || _code == 22;

  bool get isEmailNotVerified => _code == 9;

  bool get isWrongParameter => _code == 20;

  bool get isStorageSizeExceeded => _code == 23;

  bool get isPremiumFeature => _code == 29;

  bool get isConnectionError =>
      _code ==
      -10; // we have added this code for identifying request-timeouts and connection-timeouts

  final int _code;
  final String message;
}
