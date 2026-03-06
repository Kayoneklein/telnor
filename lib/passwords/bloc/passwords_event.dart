import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/sorting_order.dart';
import 'package:telnor/model/team.dart';

import '../../model/filter.dart';

abstract class PasswordsEvent extends Equatable {
  const PasswordsEvent();

  @override
  List<Object> get props => [];
}

/// List of groups loaded from the server
class GroupsLoaded extends PasswordsEvent {
  const GroupsLoaded({required this.groups});

  final BuiltList<Group>? groups;

  @override
  List<Object> get props => [groups ?? const <Group>[].toBuiltList()];
}

/// List of passwords loaded from the server
class PasswordsLoaded extends PasswordsEvent {
  const PasswordsLoaded({
    required this.isSuccess,
    this.myPasswords,
    this.sharedPasswords,
    this.myTeams,
    this.myMembers,
  });

  final bool isSuccess;
  final BuiltList<Password>? myPasswords;
  final BuiltList<Password>? sharedPasswords;
  final BuiltList<Team>? myTeams;
  final BuiltList<TeamMember>? myMembers;

  @override
  List<Object> get props => [
    isSuccess,
    myPasswords ?? const <Password>[].toBuiltList(),
    sharedPasswords ?? const <Password>[].toBuiltList(),
  ];
}

/// User pressed Retry button
class RetryPressed extends PasswordsEvent {
  const RetryPressed({this.showLoading = true});

  final bool showLoading;

  @override
  List<Object> get props => [showLoading];
}

/// User selected group to filter by
class FilterApplied extends PasswordsEvent {
  const FilterApplied({required this.filter});

  final Filter filter;

  @override
  List<Object> get props => [filter];
}

/// Passwords were filtered by location
class LocationFilterApplied extends PasswordsEvent {
  const LocationFilterApplied({required this.isSuccess, this.passwords});

  final bool isSuccess;
  final List<Password>? passwords;

  @override
  List<Object> get props => [
    isSuccess,
    passwords ?? const <Password>[].toBuiltList(),
  ];
}

/// User selected order to use for sorting
class SortingOrderChanged extends PasswordsEvent {
  const SortingOrderChanged({required this.order});

  final PasswordSortingOrder order;

  @override
  List<Object> get props => [order];
}

/// User opened or closed search view
class SearchVisibilityChanged extends PasswordsEvent {
  const SearchVisibilityChanged({required this.visible});

  final bool visible;

  @override
  List<Object> get props => [visible];
}

/// User changed input in search view
class SearchTextChanged extends PasswordsEvent {
  const SearchTextChanged({required this.text});

  final String text;

  @override
  List<Object> get props => [text];
}

/// User pressed some password
class PasswordPressed extends PasswordsEvent {
  const PasswordPressed({required this.password});

  final Password password;

  @override
  List<Object> get props => [password];
}

/// User long pressed some password
class PasswordLongPressed extends PasswordsEvent {
  const PasswordLongPressed({required this.password});

  final Password password;

  @override
  List<Object> get props => [password];
}

/// User finished selection mode
class SelectionModeFinished extends PasswordsEvent {}

/// User updated the password
class PasswordUpdated extends PasswordsEvent {
  const PasswordUpdated({required this.password});

  final Password password;

  @override
  List<Object> get props => [password];
}

/// User added the password
class PasswordAddPressed extends PasswordsEvent {
  const PasswordAddPressed({required this.password});

  final Password password;

  @override
  List<Object> get props => [password];
}

/// User intends to share password
class PasswordSharePressed extends PasswordsEvent {
  const PasswordSharePressed({required this.password});

  final Password password;

  @override
  List<Object> get props => [password];
}

/// User deleted the password
class PasswordDeletePressed extends PasswordsEvent {
  const PasswordDeletePressed({required this.password});

  final Password password;

  @override
  List<Object> get props => [password];
}

/// User views password share info
class PasswordShareInfoPressed extends PasswordsEvent {
  const PasswordShareInfoPressed({required this.password});

  final Password password;

  @override
  List<Object> get props => [password];
}

/// All passwords selected
class SelectAllPressed extends PasswordsEvent {}

/// All passwords deselected
class DeselectAllPressed extends PasswordsEvent {}

/// User intends to share all selected passwords
class ShareSelectedPressed extends PasswordsEvent {}

/// Selected passwords deleted
class DeleteSelectedPressed extends PasswordsEvent {}

/// Passwords saved to the server
class PasswordsSaved extends PasswordsEvent {
  const PasswordsSaved({required this.isSuccess});

  final bool isSuccess;

  @override
  List<Object> get props => [isSuccess];
}

/// User picked members to share password with
class SharingMembersSelected extends PasswordsEvent {
  const SharingMembersSelected({
    required this.passwords,
    required this.members,
    required this.initialSelectedMembersAndTeams,
  });

  final List<Password> passwords;
  final List<TeamMember> members;
  final List<TeamMember> initialSelectedMembersAndTeams;

  @override
  List<Object> get props => [passwords, members];
}

/// Passwords sharing complete
class PasswordsShared extends PasswordsEvent {
  const PasswordsShared({required this.isSuccess, this.newPasswords});

  final bool isSuccess;
  final BuiltList<Password>? newPasswords;

  @override
  List<Object> get props => [
    isSuccess,
    newPasswords ?? const <Password>[].toBuiltList(),
  ];
}

/// Session expired
class SessionExpired extends PasswordsEvent {
  const SessionExpired();
}

/// Auto fill password
class AutofillPasswordEvent extends PasswordsEvent {
  const AutofillPasswordEvent({this.password});

  final Password? password;

  @override
  List<Object> get props => [password ?? ''];
}

/// send password
class StorePasswordEvent extends PasswordsEvent {
  const StorePasswordEvent(this.myPasswords);

  final List<Password>? myPasswords;

  @override
  List<Object> get props => [myPasswords ?? ''];
}

/// Filter By Domain
class PasswordFilterByDomain extends PasswordsEvent {
  const PasswordFilterByDomain({this.myDomain, this.myPasswords});

  final String? myDomain;
  final List<Password>? myPasswords;

  @override
  List<Object> get props => [myDomain ?? '', myPasswords ?? ''];
}

/// very first time login
class VeryFirstTimeLogin extends PasswordsEvent {}

/// show save password toast
class ShowSavePasswordToast extends PasswordsEvent {}

/// Ask if user wants to save new password or update an existing one
class SaveOrUpdateConfirmationRequested extends PasswordsEvent {
  const SaveOrUpdateConfirmationRequested({
    required this.receivedPassword,
    required this.passwords,
    required this.teamsList,
    required this.membersList,
  });

  final Map<String, dynamic> receivedPassword;
  final BuiltList<Password> passwords;
  final List<Team> teamsList;
  final List<TeamMember> membersList;

  @override
  List<Object> get props => [receivedPassword];
}

/// Event for when user selects to save-new-password
/// during confirmation dialog
class SaveNewPasswordFromAutofill extends PasswordsEvent {
  const SaveNewPasswordFromAutofill({
    required this.receivedPassword,
    required this.passwords,
    required this.teamsList,
    required this.membersList,
  });

  final Map<String, dynamic> receivedPassword;
  final BuiltList<Password> passwords;
  final List<Team> teamsList;
  final List<TeamMember> membersList;

  @override
  List<Object> get props => [
    receivedPassword,
    passwords,
    teamsList,
    membersList,
  ];
}

/// Event for when user selects to save-new-password
/// during confirmation dialog. So we load initial passwords from which user will
/// select one to update.
class LoadInitialPasswordsForUpdateFromAutofill extends PasswordsEvent {
  const LoadInitialPasswordsForUpdateFromAutofill();

  @override
  List<Object> get props => [];
}

/// Event for when user selects to Update existing password
/// during confirmation dialog
class UpdatePasswordFromAutofill extends PasswordsEvent {
  const UpdatePasswordFromAutofill({required this.passwordToUpdate});

  final Password passwordToUpdate;

  @override
  List<Object> get props => [passwordToUpdate];
}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends PasswordsEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}

class ChangeReadOnlyMode extends PasswordsEvent {
  const ChangeReadOnlyMode(this.readOnlyMode);

  final bool readOnlyMode;

  @override
  List<Object> get props => [readOnlyMode];
}
