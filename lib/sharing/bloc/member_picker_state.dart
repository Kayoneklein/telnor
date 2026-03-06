import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/sharing/bloc/member_picker.dart';

class MemberPickerState extends Equatable {
  const MemberPickerState({
    required this.currentTab,
    required this.isLoading,
    required this.isLoadingError,
    required this.allTeams,
    required this.filteredTeams,
    required this.selectedTeamIds,
    required this.initialSelectedTeamIds,
    required this.selectedTeamId,
    required this.allMembers,
    required this.filteredMembers,
    required this.selectedMemberIds,
    required this.initialSelectedMemberIds,
    required this.isSearchVisible,
    required this.searchQuery,
    required this.emailTeams,
    required this.selectedEmailTeamId,
    required this.email,
    required this.emailList,
  });

  factory MemberPickerState.initial(
    Iterable<int>? pickedTeams,
    Iterable<TeamMemberIdPair>? pickedMembers,
  ) => MemberPickerState(
    currentTab: MemberPickerTab.teams,
    isLoading: true,
    isLoadingError: false,
    allTeams: null,
    filteredTeams: BuiltList.from(<Team>[]),
    selectedTeamIds: BuiltSet.from(pickedTeams ?? <int>[]),
    initialSelectedTeamIds: BuiltSet.from(pickedTeams ?? <int>[]),
    selectedTeamId: -1,
    allMembers: BuiltList.from(<TeamMember>[]),
    filteredMembers: BuiltList.from(<TeamMember>[]),
    selectedMemberIds: BuiltSet.from(pickedMembers ?? <TeamMemberIdPair>{}),
    initialSelectedMemberIds: BuiltSet.from(
      pickedMembers ?? <TeamMemberIdPair>{},
    ),
    isSearchVisible: false,
    searchQuery: '',
    emailTeams: null,
    selectedEmailTeamId: -1,
    email: '',
    emailList: BuiltList.from(<TeamMember>[]),
  );

  final MemberPickerTab currentTab;
  final bool isLoading;
  final bool isLoadingError;
  final BuiltList<Team>? allTeams;
  final BuiltList<Team> filteredTeams;
  final BuiltSet<int> selectedTeamIds;
  final BuiltSet<int> initialSelectedTeamIds;
  final int selectedTeamId;
  final BuiltList<TeamMember> allMembers;
  final BuiltList<TeamMember> filteredMembers;
  final BuiltSet<TeamMemberIdPair> selectedMemberIds;
  final BuiltSet<TeamMemberIdPair> initialSelectedMemberIds;
  final bool isSearchVisible;
  final String searchQuery;
  final BuiltList<Team>? emailTeams;
  final int selectedEmailTeamId;
  final String email;
  final BuiltList<TeamMember> emailList;

  MemberPickerState copyWith({
    MemberPickerTab? currentTab,
    bool? isLoading,
    bool? isLoadingError,
    BuiltList<Team>? allTeams,
    BuiltList<Team>? filteredTeams,
    BuiltSet<int>? selectedTeamIds,
    BuiltSet<TeamMemberIdPair>? selectedMemberIds,
    BuiltSet<int>? initialSelectedTeamIds,
    BuiltSet<TeamMemberIdPair>? initialSelectedMemberIds,
    int? selectedTeamId,
    BuiltList<TeamMember>? allMembers,
    BuiltList<TeamMember>? filteredMembers,

    bool? isSearchVisible,
    String? searchQuery,
    BuiltList<Team>? emailTeams,
    int? selectedEmailTeamId,
    String? email,
    BuiltList<TeamMember>? emailList,
  }) => MemberPickerState(
    currentTab: currentTab ?? this.currentTab,
    isLoading: isLoading ?? this.isLoading,
    isLoadingError: isLoadingError ?? this.isLoadingError,
    allTeams: allTeams ?? this.allTeams,
    filteredTeams: filteredTeams ?? this.filteredTeams,
    selectedTeamIds: selectedTeamIds ?? this.selectedTeamIds,
    selectedTeamId: selectedTeamId ?? this.selectedTeamId,
    allMembers: allMembers ?? this.allMembers,
    filteredMembers: filteredMembers ?? this.filteredMembers,
    selectedMemberIds: selectedMemberIds ?? this.selectedMemberIds,
    isSearchVisible: isSearchVisible ?? this.isSearchVisible,
    searchQuery: searchQuery ?? this.searchQuery,
    emailTeams: emailTeams ?? this.emailTeams,
    selectedEmailTeamId: selectedEmailTeamId ?? this.selectedEmailTeamId,
    email: email ?? this.email,
    emailList: emailList ?? this.emailList,
    initialSelectedTeamIds:
        initialSelectedTeamIds ?? this.initialSelectedTeamIds,
    initialSelectedMemberIds:
        initialSelectedMemberIds ?? this.initialSelectedMemberIds,
  );

  @override
  List<Object> get props => [
    currentTab,
    isLoading,
    isLoadingError,
    allTeams ?? const <Team>[].toBuiltList(),
    filteredTeams,
    selectedTeamIds,
    selectedTeamId,
    allMembers,
    filteredMembers,
    selectedMemberIds,
    isSearchVisible,
    searchQuery,
    emailTeams ?? const <Team>[].toBuiltList(),
    selectedEmailTeamId,
    email,
    emailList,
  ];
}

/// User should return to previous screen
class SelectionConfirmedState extends MemberPickerState {
  SelectionConfirmedState.from(
    MemberPickerState state, {
    required this.selectedMembers,
    required this.initialSelectedTeamsAndMembers,
  }) : super(
         currentTab: state.currentTab,
         isLoading: state.isLoading,
         isLoadingError: state.isLoadingError,
         allTeams: state.allTeams,
         filteredTeams: state.filteredTeams,
         selectedTeamIds: state.selectedTeamIds,
         initialSelectedTeamIds: state.initialSelectedTeamIds,
         selectedTeamId: state.selectedTeamId,
         allMembers: state.allMembers,
         filteredMembers: state.filteredMembers,
         selectedMemberIds: state.selectedMemberIds,
         initialSelectedMemberIds: state.initialSelectedMemberIds,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         emailTeams: state.emailTeams,
         selectedEmailTeamId: state.selectedEmailTeamId,
         email: state.email,
         emailList: state.emailList,
       );

  final List<TeamMember> selectedMembers;
  final List<TeamMember> initialSelectedTeamsAndMembers;

  @override
  List<Object> get props => [
    isLoading,
    isLoadingError,
    allTeams ?? const <Team>[].toBuiltList(),
    filteredTeams,
    selectedTeamIds,
    selectedTeamId,
    allMembers,
    filteredMembers,
    selectedMemberIds,
    selectedMembers,
    isSearchVisible,
    searchQuery,
    emailTeams ?? const <Team>[].toBuiltList(),
    selectedEmailTeamId,
    email,
    emailList,
  ];
}

/// User should show results of members processing
class MembersProcessedState extends MemberPickerState {
  MembersProcessedState.from(
    MemberPickerState state, {
    required this.isProcessingSuccess,
    this.processedMembers,
    this.unprocessedEmails,
  }) : super(
         currentTab: state.currentTab,
         isLoading: state.isLoading,
         isLoadingError: state.isLoadingError,
         allTeams: state.allTeams,
         filteredTeams: state.filteredTeams,
         selectedTeamIds: state.selectedTeamIds,
         initialSelectedTeamIds: state.initialSelectedTeamIds,
         selectedTeamId: state.selectedTeamId,
         allMembers: state.allMembers,
         filteredMembers: state.filteredMembers,
         selectedMemberIds: state.selectedMemberIds,
         initialSelectedMemberIds: state.initialSelectedMemberIds,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         emailTeams: state.emailTeams,
         selectedEmailTeamId: state.selectedEmailTeamId,
         email: state.email,
         emailList: state.emailList,
       );

  final bool isProcessingSuccess;
  final List<TeamMember>? processedMembers;
  final List<String>? unprocessedEmails;

  @override
  List<Object> get props => [
    isLoading,
    isLoadingError,
    allTeams ?? const <Team>[].toBuiltList(),
    filteredTeams,
    selectedTeamIds,
    selectedTeamId,
    allMembers,
    filteredMembers,
    selectedMemberIds,
    isSearchVisible,
    searchQuery,
    emailTeams ?? const <Team>[].toBuiltList(),
    selectedEmailTeamId,
    email,
    emailList,
    isProcessingSuccess,
    processedMembers ?? const <TeamMember>[].toBuiltList(),
    unprocessedEmails ?? const <String>[].toBuiltList(),
  ];
}

/// Special state to indicate current session expired
class SessionExpiredState extends MemberPickerState {
  SessionExpiredState.from(MemberPickerState state)
    : super(
        currentTab: state.currentTab,
        isLoading: state.isLoading,
        isLoadingError: state.isLoadingError,
        allTeams: state.allTeams,
        filteredTeams: state.filteredTeams,
        selectedTeamIds: state.selectedTeamIds,
        initialSelectedTeamIds: state.initialSelectedTeamIds,
        selectedTeamId: state.selectedTeamId,
        allMembers: state.allMembers,
        filteredMembers: state.filteredMembers,
        selectedMemberIds: state.selectedMemberIds,
        initialSelectedMemberIds: state.initialSelectedMemberIds,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        emailTeams: state.emailTeams,
        selectedEmailTeamId: state.selectedEmailTeamId,
        email: state.email,
        emailList: state.emailList,
      );

  @override
  List<Object> get props => [
    isLoading,
    isLoadingError,
    allTeams ?? const <Team>[].toBuiltList(),
    filteredTeams,
    selectedTeamIds,
    selectedTeamId,
    allMembers,
    filteredMembers,
    selectedMemberIds,
    isSearchVisible,
    searchQuery,
    emailTeams ?? const <Team>[].toBuiltList(),
    selectedEmailTeamId,
    email,
    emailList,
  ];
}

class ConnectionErrorState extends MemberPickerState {
  ConnectionErrorState.from(
    MemberPickerState state, {
    required this.errorMessage,
  }) : super(
         currentTab: state.currentTab,
         isLoading: state.isLoading,
         isLoadingError: state.isLoadingError,
         allTeams: state.allTeams,
         filteredTeams: state.filteredTeams,
         selectedTeamIds: state.selectedTeamIds,
         initialSelectedTeamIds: state.initialSelectedTeamIds,
         selectedTeamId: state.selectedTeamId,
         allMembers: state.allMembers,
         filteredMembers: state.filteredMembers,
         selectedMemberIds: state.selectedMemberIds,
         initialSelectedMemberIds: state.initialSelectedMemberIds,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         emailTeams: state.emailTeams,
         selectedEmailTeamId: state.selectedEmailTeamId,
         email: state.email,
         emailList: state.emailList,
       );

  final String errorMessage;
  @override
  List<Object> get props => [
    errorMessage,
    isLoading,
    isLoadingError,
    allTeams ?? const <Team>[].toBuiltList(),
    filteredTeams,
    selectedTeamIds,
    selectedTeamId,
    allMembers,
    filteredMembers,
    selectedMemberIds,
    isSearchVisible,
    searchQuery,
    emailTeams ?? const <Team>[].toBuiltList(),
    selectedEmailTeamId,
    email,
    emailList,
  ];
}
