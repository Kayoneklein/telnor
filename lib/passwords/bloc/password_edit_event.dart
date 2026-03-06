import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/attachment.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/location.dart';
import 'package:telnor/passwords/bloc/password_edit.dart';

abstract class PasswordEditEvent extends Equatable {
  const PasswordEditEvent();

  @override
  List<Object> get props => [];
}

/// (Re)load list of groups
class LoadGroupsEvent extends PasswordEditEvent {}

/// List of groups finished loading
///
/// Pass *null* as [groups] argument to indicate loading error
class GroupsLoadingFinished extends PasswordEditEvent {
  const GroupsLoadingFinished({required this.groups});

  final BuiltList<Group>? groups;

  @override
  List<Object> get props => [groups ?? const <Group>[]];
}

/// List of groups finished saving
///
/// Pass *null* as [groups] argument to indicate saving error
class GroupsSavingFinished extends PasswordEditEvent {
  const GroupsSavingFinished({required this.groups});

  final BuiltList<Group>? groups;

  @override
  List<Object> get props => [groups ?? const <Group>[]];
}

/// Binary file upload finished
///
/// Pass *null* as [file] argument to indicate uploading error
class FileUploadFinished extends PasswordEditEvent {
  const FileUploadFinished({
    required this.result,
    this.file,
    this.errorDetails,
  });

  final FileUploadResult result;
  final Attachment? file;
  final String? errorDetails;

  @override
  List<Object> get props => [result, errorDetails ?? ''];
}

/// User modified password name
class NameChanged extends PasswordEditEvent {
  const NameChanged({required this.name});

  final String name;

  @override
  List<Object> get props => [name];
}

/// User modified password user name
class UsernameChanged extends PasswordEditEvent {
  const UsernameChanged({required this.username});

  final String username;

  @override
  List<Object> get props => [username];
}

/// User modified password value
class PasswordChanged extends PasswordEditEvent {
  const PasswordChanged({required this.password});

  final String password;

  @override
  List<Object> get props => [password];
}

/// User modified password URL
class UrlChanged extends PasswordEditEvent {
  const UrlChanged({required this.url});

  final String url;

  @override
  List<Object> get props => [url];
}

/// User modified password notes
class NotesChanged extends PasswordEditEvent {
  const NotesChanged({required this.notes});

  final String notes;

  @override
  List<Object> get props => [notes];
}

/// User requested to set tags
class SelectTagsPressed extends PasswordEditEvent {}

/// User changed current tag selection
class TagSelectionChanged extends PasswordEditEvent {
  const TagSelectionChanged({required this.tagId});

  final String tagId;

  @override
  List<Object> get props => [tagId];
}

/// User pressed the Create Tag button
class CreateTagPressed extends PasswordEditEvent {}

/// User confirmed tags selection
class TagsSelectionConfirmed extends PasswordEditEvent {}

/// User requested to add new tag
class NewTagAdded extends PasswordEditEvent {
  const NewTagAdded({required this.name});

  final String name;

  @override
  List<Object> get props => [name];
}

/// User requested to delete specific tag
class TagDeletePressed extends PasswordEditEvent {
  const TagDeletePressed({required this.tagId});

  final String tagId;

  @override
  List<Object> get props => [tagId];
}

/// User requested to add new location
class LocationAddPressed extends PasswordEditEvent {}

/// User requested to edit specific location
class LocationEditPressed extends PasswordEditEvent {
  const LocationEditPressed({required this.position});

  final int position;

  @override
  List<Object> get props => [position];
}

/// User requested to add new location
class LocationEditConfirmed extends PasswordEditEvent {}

/// User requested to delete specific location
class LocationDeletePressed extends PasswordEditEvent {
  const LocationDeletePressed({required this.position});

  final int position;

  @override
  List<Object> get props => [position];
}

/// User modified location title
class LocationTitleChanged extends PasswordEditEvent {
  const LocationTitleChanged({required this.title});

  final String title;

  @override
  List<Object> get props => [title];
}

/// User modified location latitude
class LocationLatitudeChanged extends PasswordEditEvent {
  const LocationLatitudeChanged({required this.latitude});

  final String latitude;

  @override
  List<Object> get props => [latitude];
}

/// User modified location longitude
class LocationLongitudeChanged extends PasswordEditEvent {
  const LocationLongitudeChanged({required this.longitude});

  final String longitude;

  @override
  List<Object> get props => [longitude];
}

/// User modified location accuracy
class LocationAccuracyChanged extends PasswordEditEvent {
  const LocationAccuracyChanged({required this.accuracy});

  final String accuracy;

  @override
  List<Object> get props => [accuracy];
}

/// User pressed 'From Address' button
class LocationFromAddressPressed extends PasswordEditEvent {}

/// User modified location address
class LocationAddressChanged extends PasswordEditEvent {
  const LocationAddressChanged({required this.address});

  final String address;

  @override
  List<Object> get props => [address];
}

/// User confirmed address to get location from
class LocationAddressInputConfirmed extends PasswordEditEvent {}

/// User cancelled address geocoding panel
class LocationAddressInputCanceled extends PasswordEditEvent {}

/// User requested to get current location
class GetCurrentLocationPressed extends PasswordEditEvent {}

/// Current location defining process has finished
class GetCurrentLocationFinished extends PasswordEditEvent {
  const GetCurrentLocationFinished({required this.isSuccess, this.location});

  final bool isSuccess;
  final Location? location;

  @override
  List<Object> get props => [isSuccess];
}

/// Location from address geocoding process has finished
class GetLocationFromAddressFinished extends PasswordEditEvent {
  const GetLocationFromAddressFinished({
    required this.isSuccess,
    this.location,
  });

  final bool isSuccess;
  final Location? location;

  @override
  List<Object> get props => [isSuccess];
}

/// User pressed the File Upload button
class FileUploadPressed extends PasswordEditEvent {}

/// User picked file for upload
class FileForUploadPicked extends PasswordEditEvent {
  const FileForUploadPicked({required this.path});

  final String path;

  @override
  List<Object> get props => [path];
}

/// User requested to delete specific file
class FileDeletePressed extends PasswordEditEvent {
  const FileDeletePressed({required this.position});

  final int position;

  @override
  List<Object> get props => [position];
}

/// User submitted the form
class FormSubmitted extends PasswordEditEvent {}

/// User canceled the form
class FormCanceled extends PasswordEditEvent {}

/// User confirms or closes the dialog
class ConfirmationSubmitted extends PasswordEditEvent {
  const ConfirmationSubmitted({required this.isConfirmed});

  final bool isConfirmed;

  @override
  List<Object> get props => [isConfirmed];
}

/// Session expired
class UnusedFilesRemoved extends PasswordEditEvent {}

/// Session expired
class SessionExpired extends PasswordEditEvent {}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends PasswordEditEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}
