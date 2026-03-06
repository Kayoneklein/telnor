import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;
import 'dart:math';

import 'package:bloc/bloc.dart';
import 'package:built_collection/built_collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_autofill_service/flutter_autofill_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/authentication/bloc/authentication.dart' as auth_bloc;
import 'package:telnor/authentication/bloc/authentication_state.dart'
    as auth_state;
import 'package:permission_handler/permission_handler.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/model/attachment.dart';
import 'package:telnor/model/configuration.dart';
import 'package:telnor/model/filter.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/location.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/sorting_order.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/util/location_service.dart';
import 'package:telnor/web/server_adapter.dart';

import '../../util/settings.dart';
import '../../web/web.dart';
import 'passwords.dart';

///Bloc that handles interactions on passwords screen
class PasswordsBloc extends Bloc<PasswordsEvent, PasswordsState> {
  PasswordsBloc({
    bool isPremium = true,
    required RemoteConfiguration configuration,
    required auth_bloc.AuthenticationBloc authBloc,
  }) : _restrictedFunctionality = !isPremium,
       _configuration = configuration,
       authenticationBloc = authBloc,
       super(PasswordsState.initial()) {
    _currentAuthState = authenticationBloc?.state;
    _authBlocStreamSubscription = authenticationBloc?.stream.listen((state) {
      _currentAuthState = state;
    });
    _loadPasswords();

    on<PasswordsEvent>((event, emit) async {
      //Groups loaded
      if (event is GroupsLoaded) {
        if (event.groups == null) {
          emit(
            state.copyWith(
              isLoading: false,
              isLoadingError: true,
              allGroups: BuiltList.from(<Group>[]),
            ),
          );
        } else {
          final filters = _generateFilters(
            event.groups!,
            state.sharedPasswords,
            state.myPasswords,
            state.myTeams,
            state.myMembers,
            _configuration,
          );
          emit(
            state.copyWith(
              allGroups: event.groups,
              allFilters: filters[_FilterType.all],
              positionFilters: filters[_FilterType.position],
              tagFilters: filters[_FilterType.tags],
              // teamFilters: filters[_FilterType.teams],
              // userFilters: filters[_FilterType.users],
              otherFilters: filters[_FilterType.other],
            ),
          );
        }
      }
      //Passwords loaded
      if (event is PasswordsLoaded) {
        if (event.isSuccess) {
          // final Settings _settings = Settings.get;
          // if(await _settings.getBoolean(Settings.IS_FROM_AUTO_FILL_REQUEST) &&  event.myPasswords?.length == 1 ){
          //  add(AutofillPasswordEvent(password:  event.myPasswords!.first));
          // }else {
          final filters = _generateFilters(
            state.allGroups,
            event.sharedPasswords!,
            event.myPasswords!,
            event.myTeams!,
            event.myMembers!,
            _configuration,
          );
          emit(
            state.copyWith(
              myPasswords: event.myPasswords,
              myMembers: event.myMembers,
              myTeams: event.myTeams,
              sharedPasswords: event.sharedPasswords,
              filteredPasswords: _applyFilter(
                event.myPasswords!,
                event.sharedPasswords!,
                state.currentFilter,
                state.currentSortingOrder,
                state.searchQuery,
              ),
              allFilters: filters[_FilterType.all],
              positionFilters: filters[_FilterType.position],
              tagFilters: filters[_FilterType.tags],
              // teamFilters: filters[_FilterType.teams],
              // userFilters: filters[_FilterType.users],
              otherFilters: filters[_FilterType.other],
              selectedPasswordIds: BuiltSet(<int>{}),
              isPasswordsAvailable: true,
              isLoading: false,
              isLoadingError: false,
            ),
          );
          //  }
        } else {
          emit(
            state.copyWith(
              isPasswordsAvailable: false,
              isLoading: false,
              isLoadingError: true,
            ),
          );
        }
      }
      //Retry pressed
      if (event is RetryPressed) {
        _loadPasswords();
        emit(
          state.copyWith(isLoading: event.showLoading, isLoadingError: false),
        );
      }
      //Filter applied
      if (event is FilterApplied) {
        if (!state.isLoadingError && !state.isLoading) {
          if (event.filter is LocationFilter) {
            permissionServiceCall();
          } else {
            emit(
              state.copyWith(
                currentFilter: event.filter,
                filteredPasswords: _applyFilter(
                  state.myPasswords,
                  state.sharedPasswords,
                  event.filter,
                  state.currentSortingOrder,
                  state.searchQuery,
                ),
              ),
            );
          }
        }
      }
      //Results of applying location filter
      if (event is LocationFilterApplied) {
        if (event.isSuccess) {
          emit(
            state.copyWith(
              isLoading: false,
              currentFilter: LocationFilter(),
              filteredPasswords: BuiltList.from(event.passwords!),
            ),
          );
        } else {
          emit(
            LocationServiceErrorState.from(state.copyWith(isLoading: false)),
          );
        }
      }
      //Sorting order changed applied
      if (event is SortingOrderChanged) {
        if (!state.isLoadingError && !state.isLoading) {
          emit(
            state.copyWith(
              currentSortingOrder: event.order,
              filteredPasswords: _applyFilter(
                state.myPasswords,
                state.sharedPasswords,
                state.currentFilter,
                event.order,
                state.searchQuery,
              ),
            ),
          );
        }
      }
      //Search view opened or closed
      if (event is SearchVisibilityChanged) {
        emit(
          state.copyWith(
            isSearchVisible: event.visible,
            currentFilter: AllFilter(),
            filteredPasswords: _applyFilter(
              state.myPasswords,
              state.sharedPasswords,
              AllFilter(),
              state.currentSortingOrder,
              state.searchQuery,
            ),
          ),
        );
        add(const SearchTextChanged(text: ''));
      }
      //Search query changed
      if (event is SearchTextChanged) {
        emit(
          state.copyWith(
            searchQuery: event.text,
            filteredPasswords: _applyFilter(
              state.myPasswords,
              state.sharedPasswords,
              state.currentFilter,
              state.currentSortingOrder,
              event.text,
            ),
          ),
        );
      }
      //Password pressed
      if (event is PasswordPressed) {
        if (state.selectionModeActive) {
          if (!event.password.isShared) {
            emit(
              state.copyWith(
                selectedPasswordIds: _toggleSetItem(
                  state.selectedPasswordIds,
                  event.password.tempId,
                ),
              ),
            );
          }
        }
      }
      //Password long pressed
      if (event is PasswordLongPressed) {
        if (state.selectionModeActive) {
          if (!event.password.isShared) {
            emit(
              state.copyWith(
                selectedPasswordIds: _toggleSetItem(
                  state.selectedPasswordIds,
                  event.password.tempId,
                ),
              ),
            );
          }
        } else if (!state.isSearchVisible) {
          emit(
            state.copyWith(
              selectionModeActive: true,
              selectedPasswordIds: BuiltSet.from(
                event.password.isShared
                    ? <int>{}
                    : <int>{event.password.tempId},
              ),
            ),
          );
        }
      }
      //User closed selection mode
      if (event is SelectionModeFinished) {
        emit(
          state.copyWith(
            selectionModeActive: false,
            selectedPasswordIds: BuiltSet(<int>{}),
          ),
        );
      }
      //Password added
      if (event is PasswordAddPressed) {
        emit(state.copyWith(isLoading: true));
        event.password.tempId =
            state.myPasswords.map((p) => p.tempId).fold(0, max) + 1;

        final isReadOnly = await Preferences().readonlyMode;
        if (isReadOnly == true) {
          emit(ShowReadOnlyModeToastState.from(state));
          return;
        }

        event.password.icon = await _loadPasswordIcon(event.password.url);
        final BuiltList<Password> passwords = state.myPasswords.rebuild(
          (b) => b.add(event.password),
        );
        final BuiltList<Group> groups = _checkForNewGroupsInPassword(
          event.password,
          state.allGroups,
        );
        _savePasswords(passwords.toList());
        final filters = _generateFilters(
          groups,
          state.sharedPasswords,
          state.myPasswords,
          state.myTeams,
          state.myMembers,
          _configuration,
        );
        emit(
          state.copyWith(
            myPasswords: passwords,
            allGroups: groups,
            allFilters: filters[_FilterType.all],
            positionFilters: filters[_FilterType.position],
            tagFilters: filters[_FilterType.tags],
            // teamFilters: filters[_FilterType.teams],
            // userFilters: filters[_FilterType.users],
            otherFilters: filters[_FilterType.other],
            filteredPasswords: _applyFilter(
              passwords,
              state.sharedPasswords,
              state.currentFilter,
              state.currentSortingOrder,
              state.searchQuery,
            ),
          ),
        );
      }
      //Password updated
      if (event is PasswordUpdated) {
        final isReadOnly = await Preferences().readonlyMode;
        if (isReadOnly == true) {
          emit(ShowReadOnlyModeToastState.from(state));
          return;
        }

        if (state.myPasswords.any((p) => p.tempId == event.password.tempId)) {
          emit(state.copyWith(isLoading: true));
          event.password.icon = await _loadPasswordIcon(event.password.url);
          final BuiltList<Password> passwords = state.myPasswords.rebuild(
            (b) => b.map(
              (p) => p.tempId == event.password.tempId ? event.password : p,
            ),
          );
          final BuiltList<Group> groups = _checkForNewGroupsInPassword(
            event.password,
            state.allGroups,
          );
          if (event.password.shares.isNotEmpty) {
            _updateShares(event.password, passwords);
          } else {
            _savePasswords(passwords.toList());
          }
          final filters = _generateFilters(
            groups,
            state.sharedPasswords,
            state.myPasswords,
            state.myTeams,
            state.myMembers,
            _configuration,
          );
          emit(
            state.copyWith(
              isLoading: false,
              myPasswords: passwords,
              allGroups: groups,
              allFilters: filters[_FilterType.all],
              positionFilters: filters[_FilterType.position],
              tagFilters: filters[_FilterType.tags],
              // teamFilters: filters[_FilterType.teams],
              // userFilters: filters[_FilterType.users],
              otherFilters: filters[_FilterType.other],
              filteredPasswords: _applyFilter(
                passwords,
                state.sharedPasswords,
                state.currentFilter,
                state.currentSortingOrder,
                state.searchQuery,
              ),
            ),
          );
        }
      }
      //Password shared
      if (event is PasswordSharePressed) {
        if (state.myPasswords.any((p) => p.tempId == event.password.tempId)) {
          final password = state.myPasswords.firstWhere(
            (p) => p.tempId == event.password.tempId,
          );
          if (_restrictedFunctionality && password.files.isNotEmpty) {
            emit(PremiumRequiredState.from(state));
          } else {
            emit(
              SharingPermittedState.from(state, passwordsToShare: [password]),
            );
          }
        }
      }
      //Password deleted
      if (event is PasswordDeletePressed) {
        if (state.myPasswords.any((p) => p.tempId == event.password.tempId)) {
          final BuiltList<Password> passwords = state.myPasswords.rebuild(
            (b) => b.removeWhere((p) => p.tempId == event.password.tempId),
          );
          _savePasswords(passwords.toList());
          if (event.password.shares.isNotEmpty) {
            _deleteShares([event.password], passwords);
          } else {
            _savePasswords(passwords.toList());
          }
          if (event.password.files.isNotEmpty) {
            _deleteAttachments([event.password]);
          }
          emit(
            state.copyWith(
              isLoading: true,
              myPasswords: passwords,
              filteredPasswords: _applyFilter(
                passwords,
                state.sharedPasswords,
                state.currentFilter,
                state.currentSortingOrder,
                state.searchQuery,
              ),
            ),
          );
        }
      }
      //Show password share info
      if (event is PasswordShareInfoPressed) {
        emit(state.copyWith(currentShareInfo: event.password.shareInfo));
      }
      //All passwords selected
      if (event is SelectAllPressed) {
        emit(
          state.copyWith(
            selectedPasswordIds: BuiltSet.from(
              state.filteredPasswords
                  .where((p) => !p.isShared)
                  .map<int>((p) => p.tempId),
            ),
          ),
        );
      }
      //All passwords deselected
      if (event is DeselectAllPressed) {
        emit(state.copyWith(selectedPasswordIds: BuiltSet.from(<int>[])));
      }
      //Selected passwords shared
      if (event is ShareSelectedPressed) {
        if (state.selectedPasswordIds.isNotEmpty) {
          final passwords = state.myPasswords
              .where((p) => state.selectedPasswordIds.contains(p.tempId))
              .toList();
          if (_restrictedFunctionality &&
              passwords.any((p) => p.files.isNotEmpty)) {
            emit(PremiumRequiredState.from(state));
          } else {
            emit(
              SharingPermittedState.from(
                state.copyWith(
                  selectionModeActive: false,
                  selectedPasswordIds: BuiltSet(<int>{}),
                ),
                passwordsToShare: passwords,
              ),
            );
          }
        } else {
          emit(
            state.copyWith(
              selectionModeActive: false,
              selectedPasswordIds: BuiltSet(<int>{}),
            ),
          );
        }
      }
      //Selected passwords deleted
      if (event is DeleteSelectedPressed) {
        if (state.selectedPasswordIds.isNotEmpty) {
          final BuiltList<Password> passwords = state.myPasswords.rebuild(
            (b) => b.removeWhere(
              (p) => state.selectedPasswordIds.contains(p.tempId),
            ),
          );
          final passwordsToDelete = state.myPasswords
              .where((p) => state.selectedPasswordIds.contains(p.tempId))
              .toList();
          if (passwordsToDelete.any((p) => p.shares.isNotEmpty)) {
            _deleteShares(passwordsToDelete, passwords);
          } else {
            _savePasswords(passwords.toList());
          }
          if (passwordsToDelete.any((p) => p.files.isNotEmpty)) {
            _deleteAttachments(passwordsToDelete);
          }
          emit(
            state.copyWith(
              isLoading: true,
              myPasswords: passwords,
              filteredPasswords: _applyFilter(
                passwords,
                state.sharedPasswords,
                state.currentFilter,
                state.currentSortingOrder,
                state.searchQuery,
              ),
              selectionModeActive: false,
              selectedPasswordIds: BuiltSet(<int>{}),
            ),
          );
        } else {
          emit(
            state.copyWith(
              selectionModeActive: false,
              selectedPasswordIds: BuiltSet(<int>{}),
            ),
          );
        }
      }
      //Passwords saved
      if (event is PasswordsSaved) {
        emit(
          PasswordsSavedState.from(state, isSavedSuccessfully: event.isSuccess),
        );
      }
      //Sharing members selected
      if (event is SharingMembersSelected) {
        emit(state.copyWith(isLoading: true));
        _sharePasswords(event.passwords, event.members);
      }
      //Passwords shared
      if (event is PasswordsShared) {
        _loadPasswords();
        if (event.isSuccess) {
          emit(
            PasswordsSharedState.from(
              state.copyWith(
                myPasswords: event.newPasswords,
                filteredPasswords: _applyFilter(
                  event.newPasswords!,
                  state.sharedPasswords,
                  state.currentFilter,
                  state.currentSortingOrder,
                  state.searchQuery,
                ),
              ),
              isSharedSuccessfully: true,
            ),
          );
        } else {
          emit(PasswordsSharedState.from(state, isSharedSuccessfully: false));
        }
      }

      if (event is AutofillPasswordEvent) {
        _sendPassword(event.password!);
      }

      if (event is PasswordFilterByDomain) {
        _sendMultiplePassword(event.myPasswords!);
      }

      if (event is StorePasswordEvent) {
        _storePasswordData(event.myPasswords!);

        //_storePasswordData();
      }
      //Session expired
      if (event is SessionExpired) {
        emit(SessionExpiredState());
      }

      if (event is VeryFirstTimeLogin) {
        emit(state.copyWith(veryFirstTimeLogin: true));
      }

      if (event is ShowSavePasswordToast) {
        emit(ShowSavePasswordToastState());
      }

      if (event is SaveOrUpdateConfirmationRequested) {
        emit(state.copyWith(isLoading: true));
        if (event.passwords.isEmpty) {
          _saveNewPasswordAndLoad(
            event.receivedPassword,
            event.passwords,
            event.teamsList,
            event.membersList,
          );
        } else {
          _setDataForUpdateOrSaveFromAutofill(event);
          emit(
            SaveOrUpdateConfirmationRequestedState.from(
              state,
              receivedPassword: event.receivedPassword,
              passwords: event.passwords,
              teamsList: event.teamsList,
              membersList: event.membersList,
            ),
          );
        }
        // .copyWith(isLoading: true);
      }

      if (event is SaveNewPasswordFromAutofill) {
        emit(state.copyWith(isLoading: true));
        _saveNewPasswordAndLoad(
          event.receivedPassword,
          event.passwords,
          event.teamsList,
          event.membersList,
        );
      }

      if (event is LoadInitialPasswordsForUpdateFromAutofill) {
        emit(state.copyWith(isLoading: true));
        _loadInitialPasswordsForUpdateFromAutofill();
      }

      if (event is UpdatePasswordFromAutofill) {
        emit(state.copyWith(isLoading: true));
        await _updatePasswordFromAutofillAndLoad(event.passwordToUpdate);
      }

      if (event is ConnectionErrorEvent) {
        emit(
          ConnectionErrorState.from(state, errorMessage: event.errorMessage),
        );
      }

      if (event is ChangeReadOnlyMode) {
        emit(state.copyWith(isReadOnlyMode: event.readOnlyMode));
      }
    });
  }

  bool isPasswordStored = false;
  final ServerAdapter _server = ServerAdapter.get;
  final LocationService _locations = LocationService.get;
  final bool _restrictedFunctionality;
  final RemoteConfiguration _configuration;
  final Settings _settings = Settings.get;
  final WebProvider _web = WebProvider.get;

  bool saveOrUpdateConfirmationShowing = false;
  bool isLoadingPasswordFromAutofill = false;
  bool isBiometricLockInOngoing = false;

  Map<String, dynamic>? receivedPasswordFromAutofill;
  BuiltList<Password>? passwordsForSaveOrUpdate;
  List<Team>? teamsListForSaveOrUpdate;
  List<TeamMember>? membersListForSaveOrUpdate;

  auth_bloc.AuthenticationBloc? authenticationBloc;
  auth_state.AuthenticationState? _currentAuthState;
  StreamSubscription? _authBlocStreamSubscription;

  void _setDataForUpdateOrSaveFromAutofill(
    SaveOrUpdateConfirmationRequested event,
  ) {
    receivedPasswordFromAutofill = event.receivedPassword;
    passwordsForSaveOrUpdate = event.passwords;
    teamsListForSaveOrUpdate = event.teamsList;
    membersListForSaveOrUpdate = event.membersList;
  }

  Future<void> _resetDataForUpdateOrSaveFromAutofill() async {
    receivedPasswordFromAutofill = null;
    passwordsForSaveOrUpdate = null;
    teamsListForSaveOrUpdate = null;
    membersListForSaveOrUpdate = null;
    isLoadingPasswordFromAutofill = false;
  }

  //--------------------------------------------------------------------------------------------------------------------

  ///Store password to iOS app

  static const methodChannel = MethodChannel('myPasswordManagerData');

  Future<void> _storePasswordData(final List<Password>? myPasswords) async {
    try {
      // await methodChannel.invokeMethod<void>('storePasswordData',{
      //   'passwordList':jsonEncode(myPasswords)
      //  });
      isPasswordStored = true;
      await methodChannel.invokeMethod<void>('storePasswordData', {
        'password': jsonEncode(myPasswords),
      });
    } on PlatformException catch (e) {
      throw Exception(e.message);
    }
  }

  ///Send Single password to requested app
  Future<void> _sendPassword(Password password) async {
    await AutofillService().resultWithDatasets([
      PwDataset(
        label: password.name,
        username: password.user,
        password: password.password,
      ),
    ]);
  }

  ///Send multiple password to requested app
  Future<void> _sendMultiplePassword(List<Password> passwords) async {
    await AutofillService().resultWithDatasets(
      passwords
          .map(
            (password) => PwDataset(
              label: password.name,
              username: password.user,
              password: password.password,
            ),
          )
          .toList(),
    );
  }

  /// Method Channel for Autofill
  final autofillPlatform = const MethodChannel('appData');

  Future<String?> _getAppData() async {
    try {
      final result = await autofillPlatform.invokeMethod<String>('getAppData');
      return result;
    } on PlatformException catch (e) {
      throw Exception(e.message);
    }
  }

  final platform = const MethodChannel('passwordData');

  Future<String?> _getPasswordData() async {
    try {
      final result = await platform.invokeMethod<String>('getPasswordData');
      return result;
    } on PlatformException catch (e) {
      throw Exception(e.message);
    }
  }

  ///Loads list of passwords for current user
  Future<void> _loadPasswords() async {
    if (await _settings.getBoolean(Settings.IS_FROM_AUTO_FILL_REQUEST) !=
            true &&
        await _settings.getBoolean(Settings.IS_FROM_SAVE_PASSWORD) != true) {
      final configResults = await _web.getRemoteConfig();
      if (configResults.data?.disableConfigServer == false) {
        if (await _settings.getBoolean(
              Settings.IS_LOGIN_VERY_FIRST_TIME_SETTING,
            ) !=
            true) {
          add(VeryFirstTimeLogin());
        }
      }
    }

    if (await Preferences().readonlyMode == true) {
      add(const ChangeReadOnlyMode(true));
    }

    _server.loadGroups(
      onSuccess: (g) {
        final BuiltList<Group> groups = BuiltList.from(g);
        add(GroupsLoaded(groups: groups));
        _server.loadTeamsAndMembers(
          onSuccess: (teamsList, membersList) {
            _server.loadPasswords(
              onSuccess: (p) async {
                final passwords = _processPasswordsAfterLoading(
                  BuiltList.from(p),
                  groups,
                );

                if (await _settings.getBoolean(
                  Settings.IS_FROM_AUTO_FILL_REQUEST,
                )) {
                  final String? response = await _getAppData();
                  if (kDebugMode) {
                    // print(response!);
                  }
                  final Map<String, dynamic> data = jsonDecode(
                    response ?? '{}',
                  );
                  if (data['webDomains'].isNotEmpty &&
                      passwords
                          .where(
                            (element) => element.url.contains(
                              data['webDomains'][0]['domain'],
                            ),
                          )
                          .toList()
                          .isNotEmpty) {
                    final List<Password> passwordsToSend = passwords
                        .where(
                          (element) => element.url.contains(
                            jsonDecode(
                              response ?? '{}',
                            )['webDomains'][0]['domain'],
                          ),
                        )
                        .toList();

                    await _server.loadSharedPasswords(
                      onSuccess: (sp) async {
                        passwordsToSend.addAll(
                          _processSharedPasswordsAfterLoading(
                                BuiltList.from(sp),
                              )
                              .where(
                                (element) => element.url.contains(
                                  jsonDecode(
                                    response ?? '{}',
                                  )['webDomains'][0]['domain'],
                                ),
                              )
                              .toList(),
                        );

                        while (_currentAuthState is auth_state.BiometricLock) {
                          await Future<void>.delayed(
                            const Duration(milliseconds: 700),
                          );
                        }

                        if (!(_currentAuthState is auth_state.BiometricLock) &&
                            !(_currentAuthState
                                is auth_state.ShowAuthenticationDialog) &&
                            !(_currentAuthState
                                is auth_state.Unauthenticated)) {
                          add(
                            PasswordFilterByDomain(
                              myDomain: jsonDecode(
                                response ?? '{}',
                              )['webDomains'][0]['domain'],
                              myPasswords: passwordsToSend,
                            ),
                          );
                        }
                      },
                      onError: (error) {
                        if (error.isConnectionError) {
                          add(
                            ConnectionErrorEvent(errorMessage: error.message),
                          );
                        } else {
                          add(
                            error.isSessionExpired
                                ? const SessionExpired()
                                : const PasswordsLoaded(isSuccess: false),
                          );
                        }
                      },
                    );
                  } else {
                    _server.loadSharedPasswords(
                      onSuccess: (sp) {
                        final sharedPasswords =
                            _processSharedPasswordsAfterLoading(
                              BuiltList.from(sp),
                            );
                        add(
                          PasswordsLoaded(
                            isSuccess: true,
                            myPasswords: passwords,
                            sharedPasswords: sharedPasswords,
                            myTeams: BuiltList.from(teamsList),
                            myMembers: BuiltList.from(membersList),
                          ),
                        );

                        if (Platform.isIOS) {
                          if (!isPasswordStored) {
                            add(StorePasswordEvent(passwords.toList()));
                            // add(StorePasswordEvent());
                          }
                        }
                      },
                      onError: (error) {
                        if (error.isConnectionError) {
                          add(
                            ConnectionErrorEvent(errorMessage: error.message),
                          );
                        } else {
                          add(
                            error.isSessionExpired
                                ? const SessionExpired()
                                : const PasswordsLoaded(isSuccess: false),
                          );
                        }
                      },
                    );
                  }
                } else if (await _settings.getBoolean(
                      Settings.IS_FROM_SAVE_PASSWORD,
                    ) ==
                    true) {
                  await _saveOrUpdatePassword(
                    passwords,
                    teamsList,
                    membersList,
                  );
                } else {
                  _server.loadSharedPasswords(
                    onSuccess: (sp) {
                      final sharedPasswords =
                          _processSharedPasswordsAfterLoading(
                            BuiltList.from(sp),
                          );
                      add(
                        PasswordsLoaded(
                          isSuccess: true,
                          myPasswords: passwords,
                          sharedPasswords: sharedPasswords,
                          myTeams: BuiltList.from(teamsList),
                          myMembers: BuiltList.from(membersList),
                        ),
                      );

                      if (Platform.isIOS) {
                        if (!isPasswordStored) {
                          add(StorePasswordEvent(passwords.toList()));
                          // add(StorePasswordEvent());
                        }
                      }
                    },
                    onError: (error) {
                      if (error.isConnectionError) {
                        add(ConnectionErrorEvent(errorMessage: error.message));
                      } else {
                        add(
                          error.isSessionExpired
                              ? const SessionExpired()
                              : const PasswordsLoaded(isSuccess: false),
                        );
                      }
                    },
                  );
                }
              },
              onError: (error) {
                if (error.isConnectionError) {
                  add(ConnectionErrorEvent(errorMessage: error.message));
                } else {
                  add(
                    error.isSessionExpired
                        ? const SessionExpired()
                        : const PasswordsLoaded(isSuccess: false),
                  );
                }
              },
            );
          },
          onError: (error) {
            if (error.isConnectionError) {
              add(ConnectionErrorEvent(errorMessage: error.message));
            } else {
              add(
                error.isSessionExpired
                    ? const SessionExpired()
                    : const PasswordsLoaded(isSuccess: false),
              );
            }
          },
        );
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const GroupsLoaded(groups: null),
          );
        }
      },
    );
  }

  Future<void> _saveOrUpdatePassword(
    BuiltList<Password> passwords,
    List<Team> teamsList,
    List<TeamMember> membersList,
  ) async {
    final data = await _getPasswordData();
    print('data from the function _saveOrUpdatePassword');
    print(data);

    final Map<String, dynamic> passwordJson = jsonDecode(data ?? '{}');
    print('passwordJson data being decoded');
    print(passwordJson);
    // fire an event to ask user what he wants to do?
    // add new-password or update existing one
    add(
      SaveOrUpdateConfirmationRequested(
        receivedPassword: passwordJson,
        passwords: passwords,
        teamsList: teamsList,
        membersList: membersList,
      ),
    );
  }

  Future<void> _saveNewPasswordAndLoad(
    Map<String, dynamic>? data,
    BuiltList<Password> passwords,
    List<Team> teamsList,
    List<TeamMember> membersList,
  ) async {
    final Password passwordD = Password(
      groupIds: <String>[],
      name: '',
      user: '',
      password: '',
      url: '',
      note: '',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      locations: <Location>[],
      files: <Attachment>[],
      shares: <int, List<int>>{},
      shareChanges: <int, List<int>>{},
      shareTeamIds: <int>[],
      id: '',
    );

    final domains = data?['webDomains'] as List<dynamic>? ?? <dynamic>[];
    final username = data?['saveInfo']['username'] as String? ?? '';
    final String passwordName = domains.isEmpty
        ? username
        : domains.first['domain'];
    final Password passwordData = passwordD.copyWith(
      id: _generateIdentifier(),
      name: passwordName.isNotEmpty
          ? passwordName
          : _getRandomDefaultPasswordTitle(),
      user: data?['saveInfo']['username'],
      password: data?['saveInfo']['password'],
      url: data?['webDomains'].isEmpty
          ? ''
          : data?['webDomains'][0]['scheme'] +
                '://' +
                data?['webDomains'][0]['domain'],
      note: 'From mobile app',
      tags: <Group>[],
    );

    await _server.loadSharedPasswords(
      onSuccess: (sp) async {
        if (await _settings.getBoolean(Settings.IS_FROM_SAVE_PASSWORD) ==
            true) {
          Future.delayed(const Duration(seconds: 0), () async {
            add(PasswordAddPressed(password: passwordData));
            await _settings.setBoolean(
              Settings.IS_FROM_AUTO_FILL_REQUEST,
              false,
            );
            await _settings.setBoolean(Settings.IS_FROM_SAVE_PASSWORD, false);
          });
          final sharedPasswords = _processSharedPasswordsAfterLoading(
            BuiltList.from(sp),
          );
          add(
            PasswordsLoaded(
              isSuccess: true,
              myPasswords: passwords,
              sharedPasswords: sharedPasswords,
              myTeams: BuiltList.from(teamsList),
              myMembers: BuiltList.from(membersList),
            ),
          );

          //  add(ShowSavePasswordToast());

          if (Platform.isIOS) {
            if (!isPasswordStored) {
              add(StorePasswordEvent(passwords.toList()));
              // add(StorePasswordEvent());
            }
          }
          await _resetDataForUpdateOrSaveFromAutofill();
        }
      },
      onError: (error) async {
        add(
          error.isSessionExpired
              ? const SessionExpired()
              : const PasswordsLoaded(isSuccess: false),
        );
        await _resetDataForUpdateOrSaveFromAutofill();
      },
    );
  }

  String _getRandomDefaultPasswordTitle() {
    final now = DateTime.now();
    final day = now.day;
    final month = now.month;
    final year = now.year;
    final title = '$day/$month/$year';
    return title;
  }

  Future<void> _loadInitialPasswordsForUpdateFromAutofill() async {
    // if (receivedPasswordFromAutofill?['webDomains'].isNotEmpty &&
    //     passwordsForSaveOrUpdate != null &&
    //     passwordsForSaveOrUpdate
    //         !.where((element) =>
    //             element.url.contains(receivedPasswordFromAutofill?['webDomains'][0]['domain']))
    //         .toList()
    //         .isNotEmpty) {
    //   final passwordsToSend = passwordsForSaveOrUpdate
    //       ?.where((element) => element.url.contains(
    //           receivedPasswordFromAutofill?['webDomains'][0]['domain']))
    //       .toList();
    //
    //   isLoadingPasswordFromAutofill = true;
    //   add(
    //     PasswordFilterByDomain(
    //       myDomain: receivedPasswordFromAutofill?['webDomains'][0]['domain'],
    //       myPasswords: passwordsToSend,
    //     ),
    //   );
    // } else {
    _server.loadSharedPasswords(
      onSuccess: (sp) async {
        final sharedPasswords = _processSharedPasswordsAfterLoading(
          BuiltList.from(sp),
        );
        isLoadingPasswordFromAutofill = true;
        add(
          PasswordsLoaded(
            isSuccess: true,
            myPasswords: passwordsForSaveOrUpdate,
            sharedPasswords: sharedPasswords,
            myTeams: BuiltList.from(teamsListForSaveOrUpdate ?? <Team>[]),
            myMembers: BuiltList.from(
              membersListForSaveOrUpdate ?? <TeamMember>[],
            ),
          ),
        );

        if (Platform.isIOS) {
          if (!isPasswordStored) {
            add(StorePasswordEvent(passwordsForSaveOrUpdate?.toList()));
          }
        }
      },
      onError: (error) {
        add(
          error.isSessionExpired
              ? const SessionExpired()
              : const PasswordsLoaded(isSuccess: false),
        );
      },
    );
    // }
  }

  Future<void> _updatePasswordFromAutofillAndLoad(
    Password passwordToUpdate,
  ) async {
    final Password passwordData = passwordToUpdate.copyWith(
      user: receivedPasswordFromAutofill?['saveInfo']['username'],
      password: receivedPasswordFromAutofill?['saveInfo']['password'],
    );

    await _server.loadSharedPasswords(
      onSuccess: (sp) async {
        if (await _settings.getBoolean(Settings.IS_FROM_SAVE_PASSWORD) ==
            true) {
          add(PasswordUpdated(password: passwordData));
          await _settings.setBoolean(Settings.IS_FROM_AUTO_FILL_REQUEST, false);
          await _settings.setBoolean(Settings.IS_FROM_SAVE_PASSWORD, false);
          await _resetDataForUpdateOrSaveFromAutofill();
        }
      },
      onError: (error) async {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const PasswordsLoaded(isSuccess: false),
          );
        }
        await _resetDataForUpdateOrSaveFromAutofill();
      },
    );
  }

  /// Load favorite icon for single password
  Future<Uint8List?> _loadPasswordIcon(String url) async {
    Uint8List? result;
    await _server.loadPasswordIcon(
      url: url,
      onSuccess: (data) {
        result = data;
      },
      onError: (error) {
        if (error.isSessionExpired) {
          add(const SessionExpired());
        }
        result = null;
      },
    );
    return result;
  }

  /// Save passwords to the server
  Future<void> _savePasswords(List<Password> passwords) async {
    await _server.savePasswords(
      passwords: passwords,
      onSuccess: () {
        if (Platform.isIOS) {
          add(StorePasswordEvent(passwords));
        }
        add(const PasswordsSaved(isSuccess: true));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const PasswordsSaved(isSuccess: false),
          );
        }
      },
    );
  }

  /// Share specified passwords with specified members
  Future<void> _sharePasswords(
    List<Password> passwords,
    List<TeamMember> members,
  ) async {
    await _server.sharePasswords(
      passwordsToShare: passwords,
      myPasswords: state.myPasswords.toList(),
      toMembers: members,
      onSuccess: (passwords) async {
        final newPasswords = state.myPasswords.rebuild((b) {
          for (var password in passwords) {
            final int index = state.myPasswords.indexWhere(
              (p) => p.tempId == password.tempId,
            );
            if (index >= 0) {
              b.removeAt(index);
              b.insert(index, password);
            }
          }
        });
        await _savePasswords(newPasswords.toList());
        add(PasswordsShared(isSuccess: true, newPasswords: newPasswords));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const PasswordsShared(isSuccess: false),
          );
        }
      },
    );
  }

  /// Update shared passwords by sharing them anew
  Future<void> _updateShares(
    Password passwordToUpdate,
    BuiltList<Password> allPasswords,
  ) async {
    await _server.updateSharedPasswords(
      passwordToUpdate: passwordToUpdate,
      myPasswords: allPasswords.toList(),
      onSuccess: (passwords) async {
        await _savePasswords(allPasswords.toList());
        add(PasswordsShared(isSuccess: true, newPasswords: allPasswords));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const PasswordsShared(isSuccess: false),
          );
        }
      },
    );
  }

  /// Delete shared passwords data
  Future<void> _deleteShares(
    List<Password> passwordsToDelete,
    BuiltList<Password> myPasswords,
  ) async {
    await _server.deleteSharedPasswords(
      passwordsToDelete: passwordsToDelete,
      myPasswords: myPasswords.toList(),
      onSuccess: (passwords) async {
        final newPasswords = myPasswords.rebuild(
          (b) => b.removeWhere(
            (p) => passwordsToDelete.any((p2) => p2.tempId == p.tempId),
          ),
        );
        _savePasswords(newPasswords.toList());
        add(PasswordsShared(isSuccess: true, newPasswords: newPasswords));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(
            error.isSessionExpired
                ? const SessionExpired()
                : const PasswordsShared(isSuccess: false),
          );
        }
      },
    );
  }

  /// Delete all files attached to passwords
  Future<void> _deleteAttachments(List<Password> passwords) async {
    final fileIds = passwords
        .map((p) => p.files)
        .expand((ff) => ff)
        .map((a) => a.id)
        .toList();
    await _server.deleteFiles(
      fileIds: fileIds,
      onSuccess: () {},
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          if (error.isSessionExpired) {
            add(const SessionExpired());
          }
        }
      },
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Apply location filter to passwords
  Future<void> _applyLocationFilter(Location? location) async {
    if (location != null) {
      final passwords =
          _applyFilter(
                state.myPasswords,
                state.sharedPasswords,
                LocationFilter(),
                state.currentSortingOrder,
                state.searchQuery,
              )
              .where(
                (p) => p.locations.any(
                  (l) => _locations.testLocationsOverlap(location, l),
                ),
              )
              .toList();
      add(LocationFilterApplied(isSuccess: true, passwords: passwords));
    } else {
      add(const LocationFilterApplied(isSuccess: false));
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Generate list of filters based on list of groups and other data
  Map<_FilterType, List<Filter>> _generateFilters(
    BuiltList<Group> groups,
    BuiltList<Password> sharedPasswords,
    BuiltList<Password> myPasswords,
    BuiltList<Team> myTeams,
    BuiltList<TeamMember> myMembers,
    RemoteConfiguration configuration,
  ) {
    final myTeamIds = myTeams.map((team) => team.id).toSet();
    final mySharedPasswordIds = myPasswords
        .expand<int>((p) => p.shares[0] ?? [])
        .toSet();
    final filteredMyTeamIds = myTeamIds.intersection(mySharedPasswordIds);

    final myTeamsDictionary = Map<int, String>.fromIterable(
      myTeams,
      key: (dynamic item) => item.id,
      value: (dynamic item) => item.name,
    );
    final myTeamShortModels = filteredMyTeamIds
        .map((id) => TeamShort(name: myTeamsDictionary[id] ?? '', id: id))
        .toList();

    final sharedTeamShortModels = sharedPasswords
        .where((p) => p.isSharedByTeam && p.creator != null)
        .map((p) => TeamShort(id: p.creator!.teamId, name: p.creator!.teamName))
        .toList();

    final teamFilters = (myTeamShortModels + sharedTeamShortModels)
        .toSet()
        .map((t) => TeamFilter(t.id, t.name))
        .toList();
    teamFilters.sort();

    final mySharedMembersIds = myPasswords
        .expand<int>((p) => p.shares.keys.where((k) => k != 0))
        .toSet()
        .toList();

    final myMembersDictionary = Map<int, TeamMember>.fromIterable(
      myMembers,
      key: (dynamic item) => item.userId,
      value: (dynamic item) => item,
    );

    final myCreatorFilters = mySharedMembersIds
        .map((element) => myMembersDictionary[element])
        .whereType<TeamMember>()
        .toList();

    final sharedCreatorFilters = sharedPasswords
        .map((p) => p.creator)
        .whereType<TeamMember>()
        .toList();

    final userFilters = (myCreatorFilters + sharedCreatorFilters)
        .toSet()
        .map((c) => CreatorFilter(c.userId, c.email))
        .toList();
    userFilters.sort();

    final List<Filter> tmpList = [];
    tmpList.add(NoTagsFilter());
    if (configuration.disableTeams != true) {
      tmpList.add(CreatedByMeFilter());
      tmpList.add(SharedByMeFilter());
      tmpList.add(SharedWithMeFilter());
      tmpList.add(NewSharesFilter());
      tmpList.add(AlarmFilter());
    }

    final filterType = <_FilterType, List<Filter>>{
      _FilterType.all: [AllFilter()],
      _FilterType.position: [LocationFilter()],
      _FilterType.tags: groups.map((g) => GroupFilter(g)).toList(),
      _FilterType.teams: teamFilters,
      _FilterType.users: userFilters,
      _FilterType.other: tmpList,
      /*_FilterType.other: [
        NoTagsFilter(),
        CreatedByMeFilter(),
        SharedByMeFilter(),
        SharedWithMeFilter(),
        NewSharesFilter(),
      ],*/
    };
    return filterType;
  }

  /// Check whether specified password contains groups that are not yet in current list of groups.
  ///
  /// If new groups are found, they are added to the list of all groups
  /// If no new groups are found, the original list is returned
  BuiltList<Group> _checkForNewGroupsInPassword(
    Password password,
    BuiltList<Group> currentGroups,
  ) {
    return currentGroups.rebuild(
      (b) => b.addAll(
        password.tags.where((t) => !currentGroups.any((g) => g.id == t.id)),
      ),
    );
  }

  /// Perform some manipulations on loaded passwords list
  BuiltList<Password> _processPasswordsAfterLoading(
    BuiltList<Password> passwords,
    BuiltList<Group> groups,
  ) {
    return BuiltList.from(
      passwords.asMap().map<int, Password>((i, p) {
        p.tempId = i + 1;
        p.tags = p.groupIds
            .map<Group?>((id) {
              final findings = groups.where((g) => g.id == id);
              return findings.isNotEmpty ? findings.first : null;
            })
            .where((g) => g != null)
            .map<Group>((g) => g!)
            .toList();
        return MapEntry(i, p);
      }).values,
    );
  }

  /// Perform some manipulations on loaded shared passwords list
  BuiltList<Password> _processSharedPasswordsAfterLoading(
    BuiltList<Password> passwords,
  ) {
    return BuiltList.from(
      passwords.asMap().map<int, Password>((i, p) {
        p.tempId = i + 1000001;
        p.tags = [];
        return MapEntry(i, p);
      }).values,
    );
  }

  /// Filter list of passwords based on the specific filter
  BuiltList<Password> _applyFilter(
    BuiltList<Password> myPasswords,
    BuiltList<Password> sharedPasswords,
    Filter filter,
    PasswordSortingOrder order,
    String searchQuery,
  ) {
    final ListBuilder<Password> builder = (myPasswords + sharedPasswords)
        .toBuilder();
    if (searchQuery.isNotEmpty) {
      builder.retainWhere(
        (p) => p.name.toLowerCase().contains(searchQuery.toLowerCase()),
      );
    } else if (filter is! AllFilter) {
      builder.retainWhere((p) => filter.test(p));
    }
    builder.sort(_getComparator(order));
    return builder.build();
  }

  /// Get appropriate comparator to sort list of passwords (based on the provided [PasswordSortingOrder])
  int Function(Password, Password) _getComparator(PasswordSortingOrder order) {
    switch (order) {
      case PasswordSortingOrder.nameAZ:
        return (Password first, Password second) =>
            first.name.toLowerCase().compareTo(second.name.toLowerCase());
      case PasswordSortingOrder.nameZA:
        return (Password first, Password second) =>
            second.name.toLowerCase().compareTo(first.name.toLowerCase());
      case PasswordSortingOrder.tagAZ:
        return (Password first, Password second) {
          final String firstName = first.tags.isNotEmpty
              ? first.tags.first.name.toLowerCase()
              : '';
          final String secondName = second.tags.isNotEmpty
              ? second.tags.first.name.toLowerCase()
              : '';
          if (firstName == secondName) {
            return first.name.toLowerCase().compareTo(
              second.name.toLowerCase(),
            );
          }
          return firstName.compareTo(secondName);
        };
      case PasswordSortingOrder.tagZA:
        return (Password first, Password second) {
          final String firstName = first.tags.isNotEmpty
              ? first.tags.first.name.toLowerCase()
              : '';
          final String secondName = second.tags.isNotEmpty
              ? second.tags.first.name.toLowerCase()
              : '';
          if (firstName == secondName) {
            second.name.toLowerCase().compareTo(first.name.toLowerCase());
          }
          return secondName.compareTo(firstName);
        };
      case PasswordSortingOrder.created:
        return (Password first, Password second) =>
            first.createdAt.compareTo(second.createdAt);
    }
  }

  Future<void> permissionServiceCall() async {
    await permissionServices().then((value) {
      if (value[Permission.location]?.isGranted == true) {
        _locations.determineCurrentLocation(
          onSuccess: (location) {
            _applyLocationFilter(location);
          },
          onFailure: (message) {
            add(const LocationFilterApplied(isSuccess: false));
          },
        );
      }
    });
  }

  /*Permission services*/
  Future<Map<Permission, PermissionStatus>> permissionServices() async {
    // You can request multiple permissions at once.
    final Map<Permission, PermissionStatus> statuses = await [
      Permission.location,
    ].request();

    if (statuses[Permission.location]?.isPermanentlyDenied == true) {
      await openAppSettings().then((value) async {
        if (value) {
          if (await Permission.location.status.isPermanentlyDenied == true &&
              await Permission.location.status.isGranted == false) {}
        }
      });
    }
    return statuses;
  }

  /// If [set] contains an [item], delete this item. Otherwise, add [item] to the [set].
  /// Return new [Set] instance in both cases
  BuiltSet<T> _toggleSetItem<T>(BuiltSet<T> set, T item) {
    if (set.contains(item)) {
      return set.rebuild((b) => b.remove(item));
    } else {
      return set.rebuild((b) => b.add(item));
    }
  }

  @override
  void onChange(Change<PasswordsState> change) {
    super.onChange(change);
  }

  @override
  void onEvent(PasswordsEvent event) {
    super.onEvent(event);
  }

  @override
  Future<void> close() async {
    await _authBlocStreamSubscription?.cancel();
    return super.close();
  }
}

//generateId
String _generateIdentifier() {
  const length = 22;
  const vocabulary =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  final rand = Random();
  final buffer = StringBuffer();
  for (int i = 0; i < length; i++) {
    buffer.write(vocabulary[rand.nextInt(vocabulary.length)]);
  }
  return buffer.toString();
}

enum _FilterType { position, all, tags, teams, users, other }
