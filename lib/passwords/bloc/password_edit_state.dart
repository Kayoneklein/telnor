import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/attachment.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/location.dart';
import 'package:telnor/model/password.dart';

import 'password_edit.dart';

enum LoadingStatus { loading, loaded, error }

enum DrawerPage { none, selectTags, addLocation, editLocation, getAddress }

enum ButtonState { visible, gone, loading }

class PasswordEditState extends Equatable {
  const PasswordEditState({
    required this.isNew,
    required this.name,
    required this.isNameValid,
    required this.username,
    required this.isUsernameValid,
    required this.password,
    required this.isPasswordValid,
    required this.url,
    required this.isUrlValid,
    required this.notes,
    required this.tags,
    required this.locations,
    required this.files,
    required this.uploadingFilesCount,
    required this.drawerPage,
    required this.allGroups,
    required this.selectedGroupIds,
    required this.groupsLoadingStatus,
    required this.locationEditPosition,
    required this.locationTitle,
    required this.locationLatitude,
    required this.isLocationLatitudeValid,
    required this.locationLongitude,
    required this.isLocationLongitudeValid,
    required this.locationAccuracy,
    required this.isLocationAccuracyValid,
    required this.myLocationState,
    required this.getAddressOkState,
    required this.locationAddress,
    required this.isLocationAddressValid,
  });

  factory PasswordEditState.initial({Password? password}) {
    if (password != null) {
      return PasswordEditState(
        isNew: false,
        name: password.name,
        isNameValid: true,
        username: password.user,
        isUsernameValid: true,
        password: password.password,
        isPasswordValid: true,
        url: password.url,
        isUrlValid: true,
        notes: password.note,
        tags: BuiltList.from(password.tags),
        locations: BuiltList.from(password.locations),
        files: BuiltList.from(password.files),
        uploadingFilesCount: 0,
        drawerPage: DrawerPage.none,
        allGroups: BuiltList(<Group>[]),
        selectedGroupIds: BuiltSet(<String>{}),
        groupsLoadingStatus: LoadingStatus.loading,
        locationEditPosition: -1,
        locationTitle: '',
        locationLatitude: '',
        isLocationLatitudeValid: true,
        locationLongitude: '',
        isLocationLongitudeValid: true,
        locationAccuracy: '',
        isLocationAccuracyValid: true,
        myLocationState: ButtonState.visible,
        getAddressOkState: ButtonState.visible,
        locationAddress: '',
        isLocationAddressValid: true,
      );
    } else {
      return PasswordEditState(
        isNew: true,
        name: '',
        isNameValid: true,
        username: '',
        isUsernameValid: true,
        password: '',
        isPasswordValid: true,
        url: '',
        isUrlValid: true,
        notes: '',
        tags: BuiltList(<Group>[]),
        locations: BuiltList(<Location>[]),
        files: BuiltList(<Attachment>[]),
        uploadingFilesCount: 0,
        drawerPage: DrawerPage.none,
        allGroups: BuiltList(<Group>[]),
        selectedGroupIds: BuiltSet(<String>{}),
        groupsLoadingStatus: LoadingStatus.loading,
        locationEditPosition: -1,
        locationTitle: '',
        locationLatitude: '',
        isLocationLatitudeValid: true,
        locationLongitude: '',
        isLocationLongitudeValid: true,
        locationAccuracy: '',
        isLocationAccuracyValid: true,
        myLocationState: ButtonState.visible,
        getAddressOkState: ButtonState.visible,
        locationAddress: '',
        isLocationAddressValid: true,
      );
    }
  }

  final bool isNew;
  final String name;
  final bool isNameValid;
  final String username;
  final bool isUsernameValid;
  final String password;
  final bool isPasswordValid;
  final String url;
  final bool isUrlValid;
  final String notes;
  final BuiltList<Group> tags;
  final int uploadingFilesCount;
  final BuiltList<Location> locations;
  final BuiltList<Attachment> files;

  final DrawerPage drawerPage;
  final ButtonState myLocationState;
  final ButtonState getAddressOkState;
  final BuiltList<Group> allGroups;
  final BuiltSet<String> selectedGroupIds;
  final LoadingStatus groupsLoadingStatus;
  final int locationEditPosition;
  final String locationTitle;
  final String locationLatitude;
  final bool isLocationLatitudeValid;
  final String locationLongitude;
  final bool isLocationLongitudeValid;
  final String locationAccuracy;
  final bool isLocationAccuracyValid;
  final String locationAddress;
  final bool isLocationAddressValid;

  PasswordEditState copyWith({
    bool? isNew,
    String? name,
    bool? isNameValid,
    String? username,
    bool? isUsernameValid,
    String? password,
    bool? isPasswordValid,
    String? url,
    bool? isUrlValid,
    String? notes,
    BuiltList<Group>? tags,
    BuiltList<Location>? locations,
    BuiltList<Attachment>? files,
    int? uploadingFilesCount,
    DrawerPage? drawerPage,
    BuiltList<Group>? allGroups,
    BuiltSet<String>? selectedGroupIds,
    LoadingStatus? groupsLoadingStatus,
    int? locationEditPosition,
    String? locationTitle,
    String? locationLatitude,
    bool? isLocationLatitudeValid,
    String? locationLongitude,
    bool? isLocationLongitudeValid,
    String? locationAccuracy,
    bool? isLocationAccuracyValid,
    ButtonState? myLocationState,
    ButtonState? getAddressOkState,
    String? locationAddress,
    bool? isLocationAddressValid,
  }) {
    return PasswordEditState(
      isNew: isNew ?? this.isNew,
      name: name ?? this.name,
      isNameValid: isNameValid ?? this.isNameValid,
      username: username ?? this.username,
      isUsernameValid: isUsernameValid ?? this.isUsernameValid,
      password: password ?? this.password,
      isPasswordValid: isPasswordValid ?? this.isPasswordValid,
      url: url ?? this.url,
      isUrlValid: isUrlValid ?? this.isUrlValid,
      notes: notes ?? this.notes,
      tags: tags ?? this.tags,
      locations: locations ?? this.locations,
      files: files ?? this.files,
      uploadingFilesCount: uploadingFilesCount ?? this.uploadingFilesCount,
      drawerPage: drawerPage ?? this.drawerPage,
      allGroups: allGroups ?? this.allGroups,
      selectedGroupIds: selectedGroupIds ?? this.selectedGroupIds,
      groupsLoadingStatus: groupsLoadingStatus ?? this.groupsLoadingStatus,
      locationEditPosition: locationEditPosition ?? this.locationEditPosition,
      locationTitle: locationTitle ?? this.locationTitle,
      locationLatitude: locationLatitude ?? this.locationLatitude,
      isLocationLatitudeValid:
          isLocationLatitudeValid ?? this.isLocationLatitudeValid,
      locationLongitude: locationLongitude ?? this.locationLongitude,
      isLocationLongitudeValid:
          isLocationLongitudeValid ?? this.isLocationLongitudeValid,
      locationAccuracy: locationAccuracy ?? this.locationAccuracy,
      isLocationAccuracyValid:
          isLocationAccuracyValid ?? this.isLocationAccuracyValid,
      myLocationState: myLocationState ?? this.myLocationState,
      getAddressOkState: getAddressOkState ?? this.getAddressOkState,
      locationAddress: locationAddress ?? this.locationAddress,
      isLocationAddressValid:
          isLocationAddressValid ?? this.isLocationAddressValid,
    );
  }

  @override
  List<Object> get props => [
    isNew,
    name,
    isNameValid,
    username,
    isUsernameValid,
    password,
    isPasswordValid,
    url,
    isUrlValid,
    notes,
    tags,
    locations,
    files,
    uploadingFilesCount,
    drawerPage,
    allGroups,
    selectedGroupIds,
    groupsLoadingStatus,
    locationEditPosition,
    locationTitle,
    locationLatitude,
    isLocationLatitudeValid,
    locationLongitude,
    isLocationLongitudeValid,
    locationAccuracy,
    isLocationAccuracyValid,
    myLocationState,
    getAddressOkState,
    locationAddress,
    isLocationAddressValid,
  ];
}

/// Show tag creation dialog and proceed creating tag
class TagCreationPermittedState extends PasswordEditState {
  TagCreationPermittedState.from(PasswordEditState state)
    : super(
        isNew: state.isNew,
        name: state.name,
        isNameValid: state.isNameValid,
        username: state.username,
        isUsernameValid: state.isUsernameValid,
        password: state.password,
        isPasswordValid: state.isPasswordValid,
        url: state.url,
        isUrlValid: state.isUrlValid,
        notes: state.notes,
        tags: state.tags,
        locations: state.locations,
        files: state.files,
        uploadingFilesCount: state.uploadingFilesCount,
        drawerPage: state.drawerPage,
        allGroups: state.allGroups,
        selectedGroupIds: state.selectedGroupIds,
        groupsLoadingStatus: state.groupsLoadingStatus,
        locationEditPosition: state.locationEditPosition,
        locationTitle: state.locationTitle,
        locationLatitude: state.locationLatitude,
        isLocationLatitudeValid: state.isLocationLatitudeValid,
        locationLongitude: state.locationLongitude,
        isLocationLongitudeValid: state.isLocationLongitudeValid,
        locationAccuracy: state.locationAccuracy,
        isLocationAccuracyValid: state.isLocationAccuracyValid,
        myLocationState: state.myLocationState,
        getAddressOkState: state.getAddressOkState,
        locationAddress: state.locationAddress,
        isLocationAddressValid: state.isLocationAddressValid,
      );

  final DateTime _timestamp = DateTime.now();

  @override
  List<Object> get props => [_timestamp];
}

/// Show file picker dialog and proceed uploading files
class FileUploadPermittedState extends PasswordEditState {
  FileUploadPermittedState.from(PasswordEditState state)
    : super(
        isNew: state.isNew,
        name: state.name,
        isNameValid: state.isNameValid,
        username: state.username,
        isUsernameValid: state.isUsernameValid,
        password: state.password,
        isPasswordValid: state.isPasswordValid,
        url: state.url,
        isUrlValid: state.isUrlValid,
        notes: state.notes,
        tags: state.tags,
        locations: state.locations,
        files: state.files,
        uploadingFilesCount: state.uploadingFilesCount,
        drawerPage: state.drawerPage,
        allGroups: state.allGroups,
        selectedGroupIds: state.selectedGroupIds,
        groupsLoadingStatus: state.groupsLoadingStatus,
        locationEditPosition: state.locationEditPosition,
        locationTitle: state.locationTitle,
        locationLatitude: state.locationLatitude,
        isLocationLatitudeValid: state.isLocationLatitudeValid,
        locationLongitude: state.locationLongitude,
        isLocationLongitudeValid: state.isLocationLongitudeValid,
        locationAccuracy: state.locationAccuracy,
        isLocationAccuracyValid: state.isLocationAccuracyValid,
        myLocationState: state.myLocationState,
        getAddressOkState: state.getAddressOkState,
        locationAddress: state.locationAddress,
        isLocationAddressValid: state.isLocationAddressValid,
      );

  final DateTime _timestamp = DateTime.now();

  @override
  List<Object> get props => [_timestamp];
}

/// Screen needs to show file upload results
class FileUploadResultState extends PasswordEditState {
  FileUploadResultState.from(
    PasswordEditState state, {
    required this.uploadResult,
    this.errorDetails,
    BuiltList<Attachment>? files,
    int? uploadingFilesCount,
  }) : super(
         isNew: state.isNew,
         name: state.name,
         isNameValid: state.isNameValid,
         username: state.username,
         isUsernameValid: state.isUsernameValid,
         password: state.password,
         isPasswordValid: state.isPasswordValid,
         url: state.url,
         isUrlValid: state.isUrlValid,
         notes: state.notes,
         tags: state.tags,
         locations: state.locations,
         files: files ?? state.files,
         uploadingFilesCount: uploadingFilesCount ?? state.uploadingFilesCount,
         drawerPage: state.drawerPage,
         allGroups: state.allGroups,
         selectedGroupIds: state.selectedGroupIds,
         groupsLoadingStatus: state.groupsLoadingStatus,
         locationEditPosition: state.locationEditPosition,
         locationTitle: state.locationTitle,
         locationLatitude: state.locationLatitude,
         isLocationLatitudeValid: state.isLocationLatitudeValid,
         locationLongitude: state.locationLongitude,
         isLocationLongitudeValid: state.isLocationLongitudeValid,
         locationAccuracy: state.locationAccuracy,
         isLocationAccuracyValid: state.isLocationAccuracyValid,
         myLocationState: state.myLocationState,
         getAddressOkState: state.getAddressOkState,
         locationAddress: state.locationAddress,
         isLocationAddressValid: state.isLocationAddressValid,
       );

  final FileUploadResult uploadResult;
  final String? errorDetails;

  @override
  List<Object> get props => [
    isNew,
    name,
    isNameValid,
    username,
    isUsernameValid,
    password,
    isPasswordValid,
    url,
    isUrlValid,
    notes,
    tags,
    locations,
    files,
    uploadingFilesCount,
    drawerPage,
    allGroups,
    selectedGroupIds,
    groupsLoadingStatus,
    locationEditPosition,
    locationTitle,
    locationLatitude,
    isLocationLatitudeValid,
    locationLongitude,
    isLocationLongitudeValid,
    locationAccuracy,
    isLocationAccuracyValid,
    myLocationState,
    getAddressOkState,
    locationAddress,
    uploadResult,
  ];
}

/// Screen needs to show confirmation dialog about changes discarding
class ConfirmDiscardChangesState extends PasswordEditState {
  ConfirmDiscardChangesState.from(PasswordEditState state)
    : super(
        isNew: state.isNew,
        name: state.name,
        isNameValid: state.isNameValid,
        username: state.username,
        isUsernameValid: state.isUsernameValid,
        password: state.password,
        isPasswordValid: state.isPasswordValid,
        url: state.url,
        isUrlValid: state.isUrlValid,
        notes: state.notes,
        tags: state.tags,
        locations: state.locations,
        files: state.files,
        uploadingFilesCount: state.uploadingFilesCount,
        drawerPage: state.drawerPage,
        allGroups: state.allGroups,
        selectedGroupIds: state.selectedGroupIds,
        groupsLoadingStatus: state.groupsLoadingStatus,
        locationEditPosition: state.locationEditPosition,
        locationTitle: state.locationTitle,
        locationLatitude: state.locationLatitude,
        isLocationLatitudeValid: state.isLocationLatitudeValid,
        locationLongitude: state.locationLongitude,
        isLocationLongitudeValid: state.isLocationLongitudeValid,
        locationAccuracy: state.locationAccuracy,
        isLocationAccuracyValid: state.isLocationAccuracyValid,
        myLocationState: state.myLocationState,
        getAddressOkState: state.getAddressOkState,
        locationAddress: state.locationAddress,
        isLocationAddressValid: state.isLocationAddressValid,
      );

  @override
  List<Object> get props => [
    isNew,
    name,
    isNameValid,
    username,
    isUsernameValid,
    password,
    isPasswordValid,
    url,
    isUrlValid,
    notes,
    tags,
    locations,
    files,
    uploadingFilesCount,
    drawerPage,
    allGroups,
    selectedGroupIds,
    groupsLoadingStatus,
    locationEditPosition,
    locationTitle,
    locationLatitude,
    isLocationLatitudeValid,
    locationLongitude,
    isLocationLongitudeValid,
    locationAccuracy,
    isLocationAccuracyValid,
    myLocationState,
    getAddressOkState,
    locationAddress,
    isLocationAddressValid,
  ];
}

/// Screen needs to close and return to previous screen
///
/// Optional [result] argument defines result that should be returned to previous screen
class FinishEditState extends PasswordEditState {
  FinishEditState.from(PasswordEditState state, {this.result})
    : super(
        isNew: state.isNew,
        name: state.name,
        isNameValid: state.isNameValid,
        username: state.username,
        isUsernameValid: state.isUsernameValid,
        password: state.password,
        isPasswordValid: state.isPasswordValid,
        url: state.url,
        isUrlValid: state.isUrlValid,
        notes: state.notes,
        tags: state.tags,
        locations: state.locations,
        files: state.files,
        uploadingFilesCount: state.uploadingFilesCount,
        drawerPage: state.drawerPage,
        allGroups: state.allGroups,
        selectedGroupIds: state.selectedGroupIds,
        groupsLoadingStatus: state.groupsLoadingStatus,
        locationEditPosition: state.locationEditPosition,
        locationTitle: state.locationTitle,
        locationLatitude: state.locationLatitude,
        isLocationLatitudeValid: state.isLocationLatitudeValid,
        locationLongitude: state.locationLongitude,
        isLocationLongitudeValid: state.isLocationLongitudeValid,
        locationAccuracy: state.locationAccuracy,
        isLocationAccuracyValid: state.isLocationAccuracyValid,
        myLocationState: state.myLocationState,
        getAddressOkState: state.getAddressOkState,
        locationAddress: state.locationAddress,
        isLocationAddressValid: state.isLocationAddressValid,
      );

  final Password? result;

  @override
  List<Object> get props => [
    isNew,
    name,
    isNameValid,
    username,
    isUsernameValid,
    password,
    isPasswordValid,
    url,
    isUrlValid,
    notes,
    tags,
    locations,
    files,
    uploadingFilesCount,
    drawerPage,
    allGroups,
    selectedGroupIds,
    groupsLoadingStatus,
    locationEditPosition,
    locationTitle,
    locationLatitude,
    isLocationLatitudeValid,
    locationLongitude,
    isLocationLongitudeValid,
    locationAccuracy,
    isLocationAccuracyValid,
    myLocationState,
    getAddressOkState,
    locationAddress,
    isLocationAddressValid,
  ];
}

/// Show dialog about restrictions for non-premium users
class PremiumRequiredState extends PasswordEditState {
  PremiumRequiredState.from(PasswordEditState state)
    : super(
        isNew: state.isNew,
        name: state.name,
        isNameValid: state.isNameValid,
        username: state.username,
        isUsernameValid: state.isUsernameValid,
        password: state.password,
        isPasswordValid: state.isPasswordValid,
        url: state.url,
        isUrlValid: state.isUrlValid,
        notes: state.notes,
        tags: state.tags,
        locations: state.locations,
        files: state.files,
        uploadingFilesCount: state.uploadingFilesCount,
        drawerPage: state.drawerPage,
        allGroups: state.allGroups,
        selectedGroupIds: state.selectedGroupIds,
        groupsLoadingStatus: state.groupsLoadingStatus,
        locationEditPosition: state.locationEditPosition,
        locationTitle: state.locationTitle,
        locationLatitude: state.locationLatitude,
        isLocationLatitudeValid: state.isLocationLatitudeValid,
        locationLongitude: state.locationLongitude,
        isLocationLongitudeValid: state.isLocationLongitudeValid,
        locationAccuracy: state.locationAccuracy,
        isLocationAccuracyValid: state.isLocationAccuracyValid,
        myLocationState: state.myLocationState,
        getAddressOkState: state.getAddressOkState,
        locationAddress: state.locationAddress,
        isLocationAddressValid: state.isLocationAddressValid,
      );

  final DateTime _timestamp = DateTime.now();

  @override
  List<Object> get props => [_timestamp];
}

/// User needs to return to login screen
class SessionExpiredState extends PasswordEditState {
  SessionExpiredState.from(PasswordEditState state)
    : super(
        isNew: state.isNew,
        name: state.name,
        isNameValid: state.isNameValid,
        username: state.username,
        isUsernameValid: state.isUsernameValid,
        password: state.password,
        isPasswordValid: state.isPasswordValid,
        url: state.url,
        isUrlValid: state.isUrlValid,
        notes: state.notes,
        tags: state.tags,
        locations: state.locations,
        files: state.files,
        uploadingFilesCount: state.uploadingFilesCount,
        allGroups: state.allGroups,
        selectedGroupIds: state.selectedGroupIds,
        drawerPage: state.drawerPage,
        groupsLoadingStatus: state.groupsLoadingStatus,
        locationEditPosition: state.locationEditPosition,
        locationTitle: state.locationTitle,
        locationLatitude: state.locationLatitude,
        isLocationLatitudeValid: state.isLocationLatitudeValid,
        locationLongitude: state.locationLongitude,
        isLocationLongitudeValid: state.isLocationLongitudeValid,
        locationAccuracy: state.locationAccuracy,
        isLocationAccuracyValid: state.isLocationAccuracyValid,
        myLocationState: state.myLocationState,
        getAddressOkState: state.getAddressOkState,
        locationAddress: state.locationAddress,
        isLocationAddressValid: state.isLocationAddressValid,
      );
}

/// User needs to return to login screen
class ConnectionErrorState extends PasswordEditState {
  ConnectionErrorState.from(PasswordEditState state, {this.errorMessage = ''})
    : super(
        isNew: state.isNew,
        name: state.name,
        isNameValid: state.isNameValid,
        username: state.username,
        isUsernameValid: state.isUsernameValid,
        password: state.password,
        isPasswordValid: state.isPasswordValid,
        url: state.url,
        isUrlValid: state.isUrlValid,
        notes: state.notes,
        tags: state.tags,
        locations: state.locations,
        files: state.files,
        uploadingFilesCount: state.uploadingFilesCount,
        allGroups: state.allGroups,
        selectedGroupIds: state.selectedGroupIds,
        drawerPage: state.drawerPage,
        groupsLoadingStatus: state.groupsLoadingStatus,
        locationEditPosition: state.locationEditPosition,
        locationTitle: state.locationTitle,
        locationLatitude: state.locationLatitude,
        isLocationLatitudeValid: state.isLocationLatitudeValid,
        locationLongitude: state.locationLongitude,
        isLocationLongitudeValid: state.isLocationLongitudeValid,
        locationAccuracy: state.locationAccuracy,
        isLocationAccuracyValid: state.isLocationAccuracyValid,
        myLocationState: state.myLocationState,
        getAddressOkState: state.getAddressOkState,
        locationAddress: state.locationAddress,
        isLocationAddressValid: state.isLocationAddressValid,
      );

  final String errorMessage;

  @override
  List<Object> get props => [
    errorMessage,
    isNew,
    name,
    isNameValid,
    username,
    isUsernameValid,
    password,
    isPasswordValid,
    url,
    isUrlValid,
    notes,
    tags,
    locations,
    files,
    uploadingFilesCount,
    drawerPage,
    allGroups,
    selectedGroupIds,
    groupsLoadingStatus,
    locationEditPosition,
    locationTitle,
    locationLatitude,
    isLocationLatitudeValid,
    locationLongitude,
    isLocationLongitudeValid,
    locationAccuracy,
    isLocationAccuracyValid,
    myLocationState,
    getAddressOkState,
    locationAddress,
    isLocationAddressValid,
  ];
}
