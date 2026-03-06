import 'package:equatable/equatable.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/sharing/bloc/member_picker.dart';

abstract class MemberPickerEvent extends Equatable {
  const MemberPickerEvent();

  @override
  List<Object> get props => [];
}

/// User switched to another tab
class TabSelectionChanged extends MemberPickerEvent {
  const TabSelectionChanged({required this.tab});

  final MemberPickerTab tab;

  @override
  List<Object> get props => [tab];
}

/// List of teams finished loading
class MembersLoaded extends MemberPickerEvent {
  const MembersLoaded({required this.isSuccess, this.teams, this.members});

  final bool isSuccess;
  final List<Team>? teams;
  final List<TeamMember>? members;

  @override
  List<Object> get props => [
    isSuccess,
    teams ?? const <Team>[],
    members ?? const <TeamMember>[],
  ];
}

/// User pressed 'Retry' button
class RetryPressed extends MemberPickerEvent {}

/// User selected specific team member
class TeamListItemTapped extends MemberPickerEvent {
  const TeamListItemTapped({required this.team});

  final Team team;

  @override
  List<Object> get props => [team];
}

/// User selected another team
class TeamSelectionChanged extends MemberPickerEvent {
  const TeamSelectionChanged({required this.teamId});

  final int teamId;

  @override
  List<Object> get props => [teamId];
}

/// User selected specific team member
class MemberListItemTapped extends MemberPickerEvent {
  const MemberListItemTapped({required this.member});

  final TeamMember member;

  @override
  List<Object> get props => [member];
}

/// User changed search text field visibility
class SearchVisibilityChanged extends MemberPickerEvent {
  const SearchVisibilityChanged({required this.visible});

  final bool visible;

  @override
  List<Object> get props => [visible];
}

/// User changed search query
class SearchTextChanged extends MemberPickerEvent {
  const SearchTextChanged({required this.text});

  final String text;

  @override
  List<Object> get props => [text];
}

/// User selected another team (ion email tab)
class EmailTeamSelectionChanged extends MemberPickerEvent {
  const EmailTeamSelectionChanged({required this.teamId});

  final int teamId;

  @override
  List<Object> get props => [teamId];
}

/// User changed email field
class EmailChanged extends MemberPickerEvent {
  const EmailChanged({required this.text});

  final String text;

  @override
  List<Object> get props => [text];
}

/// User added email to the list
class AddEmailPressed extends MemberPickerEvent {}

/// User deleted email from the list
class EmailItemDeletePressed extends MemberPickerEvent {
  const EmailItemDeletePressed({required this.member});

  final TeamMember member;

  @override
  List<Object> get props => [member];
}

/// User confirmed members selection
class SelectionConfirmed extends MemberPickerEvent {}

/// Finished processing new emails
class EmailsFinishedProcessing extends MemberPickerEvent {
  const EmailsFinishedProcessing({
    required this.isSuccess,
    this.processedMembers,
    this.newEmails,
  });

  final bool isSuccess;
  final List<TeamMember>? processedMembers;
  final List<String>? newEmails;

  @override
  List<Object> get props => [
    isSuccess,
    processedMembers ?? const <TeamMember>[],
    newEmails ?? const <String>[],
  ];
}

/// Current session expired
class SessionExpired extends MemberPickerEvent {}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends MemberPickerEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}
