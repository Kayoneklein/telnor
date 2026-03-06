import 'dart:async';
import 'dart:io';
import 'dart:math';

import 'package:bloc/bloc.dart';
import 'package:built_collection/built_collection.dart';
import 'package:flutter/foundation.dart';
import 'package:mime/mime.dart';
import 'package:path/path.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:telnor/model/attachment.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/location.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/util/location_service.dart';
import 'package:telnor/web/server_adapter.dart';

import './password_edit.dart';

/// Bloc for managing password edit screen
class PasswordEditBloc extends Bloc<PasswordEditEvent, PasswordEditState> {
  PasswordEditBloc({
    Password? password,
    bool isPremium = true,
    int totalFilesAttached = 0,
  }) : _originalPassword = password,
       _restrictedFunctionality = !isPremium,
       _totalFilesAttached = totalFilesAttached,
       super(PasswordEditState.initial(password: password)) {
    _loadGroups();

    on<PasswordEditEvent>((event, emit) async {
      // Groups related events
      if (event is LoadGroupsEvent) {
        emit(state.copyWith(groupsLoadingStatus: LoadingStatus.loading));
        _loadGroups();
      }
      if (event is GroupsLoadingFinished) {
        if (event.groups != null) {
          emit(
            state.copyWith(
              allGroups: event.groups,
              groupsLoadingStatus: LoadingStatus.loaded,
            ),
          );
        } else {
          emit(state.copyWith(groupsLoadingStatus: LoadingStatus.error));
        }
      }
      if (event is GroupsSavingFinished) {
        if (event.groups != null) {
          emit(
            state.copyWith(
              allGroups: event.groups,
              groupsLoadingStatus: LoadingStatus.loaded,
            ),
          );
        } else {
          emit(state.copyWith(groupsLoadingStatus: LoadingStatus.error));
        }
      }
      // Field modification events
      if (event is NameChanged) {
        emit(
          state.copyWith(
            name: event.name,
            isNameValid: (event.name != state.name) ? true : state.isNameValid,
          ),
        );
      }
      if (event is UsernameChanged) {
        emit(
          state.copyWith(
            username: event.username,
            isUsernameValid: (event.username != state.username)
                ? true
                : state.isUsernameValid,
          ),
        );
      }
      if (event is PasswordChanged) {
        emit(
          state.copyWith(
            password: event.password,
            isPasswordValid: (event.password != state.password)
                ? true
                : state.isPasswordValid,
          ),
        );
      }
      if (event is UrlChanged) {
        emit(
          state.copyWith(url: event.url, isUrlValid: _isUrlValid(event.url)),
        );
      }
      if (event is NotesChanged) {
        emit(state.copyWith(notes: event.notes));
      }
      // Tags modification events
      if (event is SelectTagsPressed) {
        emit(
          state.copyWith(
            drawerPage: DrawerPage.selectTags,
            selectedGroupIds: BuiltSet.from(
              state.tags.map<String>((t) => t.id),
            ),
          ),
        );
      }
      if (event is TagSelectionChanged) {
        emit(
          state.copyWith(
            selectedGroupIds: _toggleSetItem(
              state.selectedGroupIds,
              event.tagId,
            ),
          ),
        );
      }
      if (event is TagsSelectionConfirmed) {
        if (state.groupsLoadingStatus == LoadingStatus.loaded) {
          emit(
            state.copyWith(
              drawerPage: DrawerPage.none,
              tags: BuiltList<Group>.from(
                state.allGroups.where(
                  (g) => state.selectedGroupIds.contains(g.id),
                ),
              ),
            ),
          );
        }
      }
      if (event is CreateTagPressed) {
        if (_restrictedFunctionality && state.allGroups.length >= 3) {
          emit(PremiumRequiredState.from(state));
        } else {
          emit(TagCreationPermittedState.from(state));
        }
      }
      if (event is NewTagAdded) {
        final Group group = Group(
          id: _generateIdentifier(),
          name: event.name,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        _saveGroups(state.allGroups.rebuild((b) => b.add(group)));
        emit(state.copyWith(groupsLoadingStatus: LoadingStatus.loading));
      }
      if (event is TagDeletePressed) {
        emit(
          state.copyWith(
            tags: state.tags.rebuild(
              (b) => b.removeWhere((e) => e.id == event.tagId),
            ),
          ),
        );
      }
      //Location modification events
      if (event is LocationAddPressed) {
        if (_restrictedFunctionality && state.locations.isNotEmpty) {
          emit(
            PremiumRequiredState.from(
              state.copyWith(drawerPage: DrawerPage.none),
            ),
          );
        } else {
          emit(
            state.copyWith(
              drawerPage: DrawerPage.addLocation,
              locationEditPosition: state.locations.length,
              locationTitle: '',
              locationLatitude: '',
              isLocationLatitudeValid: true,
              locationLongitude: '',
              isLocationLongitudeValid: true,
              locationAccuracy: '',
              isLocationAccuracyValid: true,
            ),
          );
        }
      }
      if (event is LocationEditPressed) {
        final location = state.locations[event.position];
        emit(
          state.copyWith(
            drawerPage: DrawerPage.editLocation,
            locationEditPosition: event.position,
            locationTitle: location.title,
            locationLatitude: location.latitude.toString(),
            isLocationLatitudeValid: true,
            locationLongitude: location.longitude.toString(),
            isLocationLongitudeValid: true,
            locationAccuracy: location.accuracy.toString(),
            isLocationAccuracyValid: true,
          ),
        );
      }
      if (event is LocationTitleChanged) {
        emit(state.copyWith(locationTitle: event.title));
      }
      if (event is LocationLatitudeChanged) {
        emit(
          state.copyWith(
            locationLatitude: event.latitude,
            isLocationLatitudeValid: _isLatValid(event.latitude),
          ),
        );
      }
      if (event is LocationLongitudeChanged) {
        emit(
          state.copyWith(
            locationLongitude: event.longitude,
            isLocationLongitudeValid: _isLonValid(event.longitude),
          ),
        );
      }
      if (event is LocationAccuracyChanged) {
        emit(
          state.copyWith(
            locationAccuracy: event.accuracy,
            isLocationAccuracyValid: _isAccValid(event.accuracy),
          ),
        );
      }
      if (event is LocationFromAddressPressed) {
        emit(
          state.copyWith(
            drawerPage: DrawerPage.getAddress,
            locationAddress: '',
            isLocationAddressValid: true,
          ),
        );
      }
      if (event is LocationAddressChanged) {
        emit(
          state.copyWith(
            isLocationAddressValid: true,
            locationAddress: event.address,
          ),
        );
      }
      if (event is LocationAddressInputConfirmed) {
        emit(state.copyWith(getAddressOkState: ButtonState.loading));
        final location = await _server.getLocationFromAddress(
          state.locationAddress,
        );
        if (location != null) {
          add(
            GetLocationFromAddressFinished(isSuccess: true, location: location),
          );
        } else {
          add(const GetLocationFromAddressFinished(isSuccess: false));
        }
      }
      if (event is GetLocationFromAddressFinished) {
        if (event.isSuccess && event.location != null) {
          final location = event.location!;
          emit(
            state.copyWith(
              drawerPage: state.locationEditPosition < state.locations.length
                  ? DrawerPage.editLocation
                  : DrawerPage.addLocation,
              locationTitle: location.title,
              locationLatitude: location.latitude.toString(),
              isLocationLatitudeValid: _isLatValid(
                location.latitude.toString(),
              ),
              locationLongitude: location.longitude.toString(),
              isLocationLongitudeValid: _isLonValid(
                location.longitude.toString(),
              ),
              locationAccuracy: location.accuracy.toString(),
              isLocationAccuracyValid: _isAccValid(
                location.accuracy.toString(),
              ),
              getAddressOkState: ButtonState.visible,
            ),
          );
        } else {
          emit(
            state.copyWith(
              isLocationAddressValid: false,
              getAddressOkState: ButtonState.visible,
            ),
          );
        }
      }
      if (event is LocationAddressInputCanceled) {
        emit(
          state.copyWith(
            drawerPage: state.locationEditPosition < state.locations.length
                ? DrawerPage.editLocation
                : DrawerPage.addLocation,
          ),
        );
      }
      if (event is GetCurrentLocationPressed) {
        emit(state.copyWith(myLocationState: ButtonState.loading));
        permissionServiceCall();
      }
      if (event is GetCurrentLocationFinished) {
        if (event.isSuccess && event.location != null) {
          final location = event.location!;
          emit(
            state.copyWith(
              locationTitle: location.title,
              locationLatitude: location.latitude.toString(),
              isLocationLatitudeValid: _isLatValid(
                location.latitude.toString(),
              ),
              locationLongitude: location.longitude.toString(),
              isLocationLongitudeValid: _isLonValid(
                location.longitude.toString(),
              ),
              locationAccuracy: location.accuracy.toString(),
              isLocationAccuracyValid: _isAccValid(
                location.accuracy.toString(),
              ),
              myLocationState: ButtonState.visible,
            ),
          );
        } else {
          emit(state.copyWith(myLocationState: ButtonState.visible));
        }
      }
      if (event is LocationEditConfirmed) {
        final bool latitudeValid = _isLatValid(state.locationLatitude);
        final bool longitudeValid = _isLonValid(state.locationLongitude);
        final bool accuracyValid = _isAccValid(state.locationAccuracy);
        if (latitudeValid && longitudeValid && accuracyValid) {
          final location = _generateLocation();
          final locations = state.locationEditPosition < state.locations.length
              ? state.locations.rebuild(
                  (b) => b
                    ..removeAt(state.locationEditPosition)
                    ..insert(state.locationEditPosition, location),
                )
              : state.locations.rebuild((b) => b.add(location));
          emit(
            state.copyWith(drawerPage: DrawerPage.none, locations: locations),
          );
        } else {
          emit(
            state.copyWith(
              isLocationLatitudeValid: latitudeValid,
              isLocationLongitudeValid: longitudeValid,
              isLocationAccuracyValid: accuracyValid,
            ),
          );
        }
      }
      if (event is LocationDeletePressed) {
        emit(
          state.copyWith(
            locations: state.locations.rebuild(
              (b) => b.removeAt(event.position),
            ),
          ),
        );
      }
      //File modification events
      if (event is FileUploadPressed) {
        if (_restrictedFunctionality && _totalFilesAttached >= 3) {
          emit(PremiumRequiredState.from(state));
        } else {
          emit(FileUploadPermittedState.from(state));
        }
      }
      if (event is FileForUploadPicked) {
        emit(
          state.copyWith(uploadingFilesCount: state.uploadingFilesCount + 1),
        );
        _uploadFile(event.path);
      }
      if (event is FileUploadFinished) {
        if (event.result == FileUploadResult.largerThan1Mb) {
          emit(
            PremiumRequiredState.from(
              state.copyWith(
                uploadingFilesCount: state.uploadingFilesCount - 1,
              ),
            ),
          );
        } else if (event.file != null) {
          emit(
            FileUploadResultState.from(
              state,
              uploadResult: FileUploadResult.success,
              files: state.files.rebuild((b) => b.add(event.file!)),
              uploadingFilesCount: state.uploadingFilesCount - 1,
            ),
          );
        } else {
          emit(
            FileUploadResultState.from(
              state,
              uploadResult: event.result,
              errorDetails: event.errorDetails,
              uploadingFilesCount: state.uploadingFilesCount - 1,
            ),
          );
        }
      }
      if (event is FileDeletePressed) {
        emit(
          state.copyWith(
            files: state.files.rebuild((b) => b.removeAt(event.position)),
          ),
        );
      }
      // Form submission events
      if (event is FormSubmitted) {
        final bool validName = state.name.isNotEmpty;
        const bool validUsername = true; //state.username.isNotEmpty;
        const bool validPassword = true; //state.password.isNotEmpty;
        final bool validUrl = _isUrlValid(state.url);
        if (validName && validUsername && validPassword && validUrl) {
          emit(FinishEditState.from(state, result: _generatePassword()));
        } else if (state.uploadingFilesCount == 0) {
          emit(
            state.copyWith(
              isNameValid: validName,
              isUsernameValid: validUsername,
              isPasswordValid: validPassword,
              isUrlValid: validUrl,
            ),
          );
        }
      }
      if (event is FormCanceled) {
        if (state.isNew) {
          if (_isPasswordEmpty(_generatePassword())) {
            ///No need to emit this state when form is cancelled
            // emit(FinishEditState.from(state));
          } else {
            emit(ConfirmDiscardChangesState.from(state));
          }
        } else {
          if (arePasswordsEqual(_originalPassword, _generatePassword())) {
            emit(FinishEditState.from(state));
          } else {
            emit(ConfirmDiscardChangesState.from(state));
          }
        }
      }
      if (event is ConfirmationSubmitted) {
        if (event.isConfirmed) {
          _removeUnusedFiles();
        } else {
          emit(state.copyWith());
        }
      }
      if (event is UnusedFilesRemoved) {
        emit(FinishEditState.from(state));
      }

      // Session management events
      if (event is SessionExpired) {
        emit(SessionExpiredState.from(state));
      }

      if (event is ConnectionErrorEvent) {
        emit(
          ConnectionErrorState.from(state, errorMessage: event.errorMessage),
        );
      }
    });
  }

  final ServerAdapter _server = ServerAdapter.get;
  final LocationService _locations = LocationService.get;
  final Password? _originalPassword;
  final bool _restrictedFunctionality;
  final int _totalFilesAttached;

  //final _urlValidator = RegExp(r'^https?://.*$', caseSensitive: false);
  final _geoValidator = RegExp(r'^-?\d+(\.\d+)?$');
  final _accValidator = RegExp(r'^\d+$');

  bool _isUrlValid(String url) =>
      true; //url.isEmpty || _urlValidator.hasMatch(url);

  bool _isLatValid(String geo) {
    bool geoValid = false;
    if (_geoValidator.hasMatch(geo)) {
      final double value = num.tryParse(geo)?.toDouble() ?? 0.0;
      geoValid = value >= -90 && value <= 90;
    }
    return geo.isEmpty || geoValid;
  }

  bool _isLonValid(String geo) {
    bool geoValid = false;
    if (_geoValidator.hasMatch(geo)) {
      final double value = num.tryParse(geo)?.toDouble() ?? 0.0;
      geoValid = value >= -180 && value <= 180;
    }
    return geo.isEmpty || geoValid;
  }

  bool _isAccValid(String acc) => acc.isEmpty || _accValidator.hasMatch(acc);

  //--------------------------------------------------------------------------------------------------------------------
  Future<void> permissionServiceCall() async {
    await permissionServices().then((value) {
      if (value[Permission.location]?.isGranted == true) {
        _locations.determineCurrentLocation(
          onSuccess: (location) {
            add(
              GetCurrentLocationFinished(isSuccess: true, location: location),
            );
          },
          onFailure: (message) {
            add(const GetCurrentLocationFinished(isSuccess: false));
          },
        );
      }
    });
  }

  /*Permission services*/
  /*Permission services*/
  Future<Map<Permission, PermissionStatus>> permissionServices() async {
    // You can request multiple permissions at once.
    Map<Permission, PermissionStatus> statuses = await [
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

  /// Load list of available groups
  void _loadGroups() {
    _server.loadGroups(
      onSuccess: (final List<Group> groups) {
        add(GroupsLoadingFinished(groups: BuiltList.from(groups)));
      },
      onError: (error) {
        if (error.isSessionExpired) {
          add(SessionExpired());
        } else if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(const GroupsLoadingFinished(groups: null));
        }
      },
    );
  }

  /// Load list of available groups
  void _saveGroups(BuiltList<Group> groups) {
    _server.saveGroups(
      groups: groups.toList(),
      onSuccess: () {
        add(GroupsSavingFinished(groups: groups));
      },
      onError: (error) {
        if (error.isSessionExpired) {
          add(SessionExpired());
        } else if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(const GroupsSavingFinished(groups: null));
        }
      },
    );
  }

  /// Save binary file to the server
  Future<void> _uploadFile(String path) async {
    try {
      final String fileId = _generateIdentifier();
      final file = File(path);
      if (_restrictedFunctionality && file.lengthSync() > 1 * 1024 * 1024) {
        add(const FileUploadFinished(result: FileUploadResult.largerThan1Mb));
        return;
      }
      final Uint8List data = await file.readAsBytes();
      _server.saveFile(
        fileId: fileId,
        data: data,
        onSuccess: () {
          add(
            FileUploadFinished(
              result: FileUploadResult.success,
              file: Attachment(
                fileId,
                basename(path),
                lookupMimeType(path) ?? '',
              ),
            ),
          );
        },
        onError: (error) {
          if (error.isSessionExpired) {
            add(SessionExpired());
          } else if (error.isConnectionError) {
            add(ConnectionErrorEvent(errorMessage: error.message));
          } else if (error.isStorageSizeExceeded) {
            add(const FileUploadFinished(result: FileUploadResult.storageFull));
          } else {
            add(
              FileUploadFinished(
                result: FileUploadResult.otherError,
                errorDetails: error.message,
              ),
            );
          }
        },
      );
    } catch (error) {
      add(
        FileUploadFinished(
          result: FileUploadResult.otherError,
          errorDetails: error.toString(),
        ),
      );
    }
  }

  /// Remove files which were uploaded but are not needed anymore
  void _removeUnusedFiles() {
    final originalFileIds =
        _originalPassword?.files.map((a) => a.id).toList() ?? [];
    final idsToRemove = state.files
        .where((a) => !originalFileIds.contains(a.id))
        .map((a) => a.id)
        .toList();
    if (idsToRemove.isNotEmpty) {
      try {
        _server.deleteFiles(
          fileIds: idsToRemove,
          onSuccess: () {
            add(UnusedFilesRemoved());
          },
          onError: (error) {
            if (error.isSessionExpired) {
              add(SessionExpired());
            } else if (error.isConnectionError) {
              add(ConnectionErrorEvent(errorMessage: error.message));
            } else {
              add(
                FileUploadFinished(
                  result: FileUploadResult.otherError,
                  errorDetails: error.message,
                ),
              );
            }
          },
        );
      } catch (error) {
        add(
          FileUploadFinished(
            result: FileUploadResult.otherError,
            errorDetails: error.toString(),
          ),
        );
      }
    } else {
      add(UnusedFilesRemoved());
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Generate random identifier
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

  /// Generate password based on the current state
  Password _generatePassword() => Password(
    groupIds: state.tags.map((t) => t.id).toList(),
    name: state.name,
    user: state.username,
    password: state.password,
    url: _generateUrl(),
    note: state.notes,
    createdAt: _originalPassword?.createdAt ?? DateTime.now(),
    updatedAt: DateTime.now(),
    locations: state.locations.toList(),
    files: state.files.toList(),
    tempId: _originalPassword?.tempId ?? -1,
    tags: state.tags.toList(),
    shares: _originalPassword?.shares ?? {},
    shareChanges: (_originalPassword?.shareChanges ?? {})
      ..addAll(
        _originalPassword?.shares.map<int, List<int>>(
              (int k, List<int> v) => MapEntry(k, List.from(v)),
            ) ??
            {},
      ),
    shareTeamIds: _originalPassword?.shareTeamIds ?? [],
    id: _originalPassword?.id ?? _generateIdentifier(),
  );

  /// Generate URL based on the current state
  String _generateUrl() {
    if (state.url.isEmpty ||
        state.url.toLowerCase().startsWith('http://') ||
        state.url.toLowerCase().startsWith('https://')) {
      return state.url;
    } else {
      return 'http://${state.url}';
    }
  }

  /// Generate location based on the current state
  Location _generateLocation() => Location(
    title: state.locationTitle,
    latitude: state.locationLatitude.isEmpty
        ? 0.0
        : double.parse(state.locationLatitude),
    longitude: state.locationLongitude.isEmpty
        ? 0.0
        : double.parse(state.locationLongitude),
    accuracy: state.locationAccuracy.isEmpty
        ? 0
        : int.parse(state.locationAccuracy),
  );

  /// Check if password is empty
  bool _isPasswordEmpty(Password p) =>
      p.name.isEmpty &&
      p.user.isEmpty &&
      p.password.isEmpty &&
      p.url.isEmpty &&
      p.note.isEmpty &&
      p.groupIds.isEmpty &&
      p.locations.isEmpty &&
      p.files.isEmpty;

  /// Compare two passwords for equality
  bool arePasswordsEqual(Password? p1, Password? p2) =>
      p1 != null &&
      p2 != null &&
      p1.name == p2.name &&
      p1.user == p2.user &&
      p1.password == p2.password &&
      p1.url == p2.url &&
      p1.note == p2.note &&
      listEquals(p1.groupIds, p2.groupIds) &&
      listEquals(p1.locations, p2.locations) &&
      listEquals(p1.files, p2.files);

  /// If [set] contains an [item], delete this item. Otherwise, add [item] to the [set].
  /// Return new [Set] instance in both cases
  BuiltSet<T> _toggleSetItem<T>(BuiltSet<T> set, T item) {
    if (set.contains(item)) {
      return set.rebuild((b) => b.remove(item));
    } else {
      return set.rebuild((b) => b.add(item));
    }
  }
}
