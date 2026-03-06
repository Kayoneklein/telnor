import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:built_collection/built_collection.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/web/server_adapter.dart';

import 'member_picker.dart';

class MemberPickerBloc extends Bloc<MemberPickerEvent, MemberPickerState> {
  MemberPickerBloc({
    bool checkSharingOptions = false,
    Iterable<int>? pickedTeams,
    Iterable<TeamMemberIdPair>? pickedMembers,
  }) : _checkSharingOptions = checkSharingOptions,
       super(MemberPickerState.initial(pickedTeams, pickedMembers)) {
    _loadTeamsAndMembers();

    on<MemberPickerEvent>((event, emit) {
      //Tab selection changed
      if (event is TabSelectionChanged) {
        emit(
          state.copyWith(
            currentTab: event.tab,
            isSearchVisible:
                event.tab == state.currentTab && state.isSearchVisible,
            searchQuery: event.tab == state.currentTab ? state.searchQuery : '',
            filteredMembers: event.tab == state.currentTab
                ? state.filteredMembers
                : _filterMembers(state.allMembers, state.selectedTeamId, ''),
            filteredTeams: event.tab == state.currentTab
                ? state.filteredTeams
                : _filterTeams(state.allTeams, ''),
          ),
        );
      }
      //Teams finished loading
      if (event is MembersLoaded) {
        if (event.isSuccess) {
          final emailTeams = BuiltList<Team>.from(
            event.teams!.where((t) => t.isAdmin),
          );

          ///REMOVED TEAMS THAT ARE NOT APPROVED YET FROM THE LIST
          event.teams?.removeWhere((t) => t.isApproved == false);
          final BuiltList<Team> allTeams = BuiltList.from(event.teams!);

          emit(
            state.copyWith(
              isLoading: false,
              isLoadingError: false,
              allTeams: allTeams,
              allMembers: BuiltList<TeamMember>.from(
                event.members!
                    .where(
                      (m) =>
                          m.userId > -1 && m.teamId > -1 && m.publicKey != null,
                    )
                    .toList(),
              ),
              emailTeams: emailTeams,
              selectedEmailTeamId: emailTeams.isNotEmpty
                  ? emailTeams.first.id
                  : -1,
              filteredTeams: _filterTeams(allTeams, state.searchQuery),
            ),
          );
          add(const TeamSelectionChanged(teamId: -1));
        } else {
          emit(state.copyWith(isLoading: false, isLoadingError: true));
        }
      }
      //User pressed 'Retry'
      if (event is RetryPressed) {
        emit(state.copyWith(isLoading: true, isLoadingError: false));
        _loadTeamsAndMembers();
      }
      //User selected (or deselected) specific team from list
      if (event is TeamListItemTapped) {
        emit(
          state.copyWith(
            selectedTeamIds: _toggleSetItem(
              state.selectedTeamIds,
              event.team.id,
            ),
          ),
        );
      }
      //User selected another team
      if (event is TeamSelectionChanged) {
        emit(
          state.copyWith(
            selectedTeamId: event.teamId,
            filteredMembers: _filterMembers(
              state.allMembers,
              event.teamId,
              state.searchQuery,
            ),
          ),
        );
      }
      //User selected (or deselected) specific member
      if (event is MemberListItemTapped) {
        emit(
          state.copyWith(
            selectedMemberIds: _toggleSetItem(
              state.selectedMemberIds,
              TeamMemberIdPair(
                memberId: event.member.userId,
                teamId: event.member.teamId,
              ),
            ),
          ),
        );
      }
      //Search view opened or closed
      if (event is SearchVisibilityChanged) {
        if (state.currentTab == MemberPickerTab.members) {
          emit(
            state.copyWith(
              isSearchVisible: event.visible,
              searchQuery: '',
              filteredMembers: _filterMembers(
                state.allMembers,
                state.selectedTeamId,
                '',
              ),
            ),
          );
        }
        if (state.currentTab == MemberPickerTab.teams) {
          emit(
            state.copyWith(
              isSearchVisible: event.visible,
              searchQuery: '',
              filteredTeams: _filterTeams(state.allTeams, ''),
            ),
          );
        }
      }
      //Search query changed
      if (event is SearchTextChanged) {
        if (state.currentTab == MemberPickerTab.members) {
          emit(
            state.copyWith(
              searchQuery: event.text,
              filteredMembers: _filterMembers(
                state.allMembers,
                state.selectedTeamId,
                event.text,
              ),
            ),
          );
        }
        if (state.currentTab == MemberPickerTab.teams) {
          emit(
            state.copyWith(
              searchQuery: event.text,
              filteredTeams: _filterTeams(state.allTeams, event.text),
            ),
          );
        }
      }
      //User selected another team for email
      if (event is EmailTeamSelectionChanged) {
        emit(state.copyWith(selectedEmailTeamId: event.teamId));
      }
      //Email field changed
      if (event is EmailChanged) {
        emit(state.copyWith(email: event.text));
      }
      //Email added to list
      if (event is AddEmailPressed) {
        if (state.emailTeams != null) {
          if (state.email.isNotEmpty &&
              state.emailTeams!.any((t) => t.id == state.selectedEmailTeamId)) {
            if (state.emailList.any(
              (m) =>
                  m.teamId == state.selectedEmailTeamId &&
                  m.email == state.email,
            )) {
              emit(state.copyWith(email: ''));
            } else {
              emit(
                state.copyWith(
                  emailList: state.emailList.rebuild(
                    (b) => b.add(
                      TeamMember.email(
                        email: state.email,
                        team: state.emailTeams!.firstWhere(
                          (t) => t.id == state.selectedEmailTeamId,
                        ),
                      ),
                    ),
                  ),
                  email: '',
                ),
              );
            }
          }
        }
      }
      //Email added to list
      if (event is EmailItemDeletePressed) {
        emit(
          state.copyWith(
            emailList: state.emailList.rebuild(
              (b) => b.removeWhere(
                (m) =>
                    m.teamId == event.member.teamId &&
                    m.email == event.member.email,
              ),
            ),
          ),
        );
      }
      //User confirmed selection
      if (event is SelectionConfirmed) {
        switch (state.currentTab) {
          case MemberPickerTab.teams:
          case MemberPickerTab.members:
            if (state.selectedMemberIds != state.initialSelectedMemberIds ||
                state.selectedTeamIds != state.initialSelectedTeamIds) {
              final List<TeamMember> membersToSend = [];
              final List<TeamMember> initialMembersToSend = [];
              List<TeamMember> generateMembers(
                BuiltSet<TeamMemberIdPair> pair,
              ) {
                return pair
                    .map<TeamMember?>((id) {
                      final findings = state.allMembers.where(
                        (m) => m.userId == id.memberId && m.teamId == id.teamId,
                      );
                      return findings.isNotEmpty ? findings.first : null;
                    })
                    .where((t) => t != null)
                    .map((t) => t!)
                    .toList();
              }

              final selectedMembers = generateMembers(state.selectedMemberIds);
              final initialSelectedMembers = generateMembers(
                state.initialSelectedMemberIds,
              );

              List<TeamMember> generateTeams(BuiltSet<int> pair) {
                return pair
                    .map<TeamMember?>((id) {
                      final findings =
                          state.allTeams?.where((t) => t.id == id).toList() ??
                          [];
                      return findings.isNotEmpty
                          ? TeamMember.entireTeam(team: findings.first)
                          : null;
                    })
                    .where((t) => t != null)
                    .map((t) => t!)
                    .toList();
              }

              final List<TeamMember> selectedTeams = generateTeams(
                state.selectedTeamIds,
              );
              final List<TeamMember> initialSelectedTeams = generateTeams(
                state.initialSelectedTeamIds,
              );
              membersToSend.addAll(selectedMembers);
              membersToSend.addAll(selectedTeams);
              initialMembersToSend.addAll(initialSelectedMembers);
              initialMembersToSend.addAll(initialSelectedTeams);

              emit(
                SelectionConfirmedState.from(
                  state,
                  selectedMembers: membersToSend,
                  initialSelectedTeamsAndMembers: initialMembersToSend,
                ),
              );
            }
            break;
          case MemberPickerTab.email:
            if (state.emailList.isNotEmpty ||
                state.email.isNotEmpty && state.emailTeams != null) {
              final members =
                  state.emailList.toList() +
                  (state.email.isNotEmpty
                      ? [
                          TeamMember.email(
                            email: state.email,
                            team: state.emailTeams!.firstWhere(
                              (t) => t.id == state.selectedEmailTeamId,
                            ),
                          ),
                        ]
                      : <TeamMember>[]);
              if (members.isNotEmpty) {
                emit(state.copyWith(isLoading: true));
                _processNewMembers(members);
              }
            }
            break;
        }
      }
      //Emails finished processing
      if (event is EmailsFinishedProcessing) {
        emit(
          MembersProcessedState.from(
            state.copyWith(isLoading: false),
            isProcessingSuccess: event.isSuccess,
            processedMembers: event.processedMembers,
            unprocessedEmails: event.newEmails,
          ),
        );
      }
      //Session expired
      if (event is SessionExpired) {
        emit(SessionExpiredState.from(state));
      }
    });
  }

  final ServerAdapter _server = ServerAdapter.get;
  final bool _checkSharingOptions;

  /*
  @override
  Stream<MemberPickerState> mapEventToState(
    MemberPickerEvent event,
  ) async* {
    //Tab selection changed
    if (event is TabSelectionChanged) {
      yield state.copyWith(
        currentTab: event.tab,
        isSearchVisible: event.tab == state.currentTab && state.isSearchVisible,
        searchQuery: event.tab == state.currentTab ? state.searchQuery : '',
        filteredMembers: event.tab == state.currentTab
            ? state.filteredMembers
            : _filterMembers(state.allMembers, state.selectedTeamId, ''),
        filteredTeams: event.tab == state.currentTab ? state.filteredTeams : _filterTeams(state.allTeams, ''),
      );
    }
    //Teams finished loading
    if (event is MembersLoaded) {
      if (event.isSuccess) {
        final emailTeams = BuiltList<Team>.from(event.teams!.where((t) => t.isAdmin));
        final BuiltList<Team> allTeams = BuiltList.from(event.teams!);
        yield state.copyWith(
          isLoading: false,
          isLoadingError: false,
          allTeams: allTeams,
          allMembers: BuiltList<TeamMember>.from(
              event.members!.where((m) => m.userId > -1 && m.teamId > -1 && m.publicKey != null).toList()),
          emailTeams: emailTeams,
          selectedEmailTeamId: emailTeams.isNotEmpty ? emailTeams.first.id : -1,
          filteredTeams: _filterTeams(allTeams, state.searchQuery),
        );
        add(const TeamSelectionChanged(teamId: -1));
      } else {
        yield state.copyWith(
          isLoading: false,
          isLoadingError: true,
        );
      }
    }
    //User pressed 'Retry'
    if (event is RetryPressed) {
      yield state.copyWith(
        isLoading: true,
        isLoadingError: false,
      );
      _loadTeamsAndMembers();
    }
    //User selected (or deselected) specific team from list
    if (event is TeamListItemTapped) {
      yield state.copyWith(
        selectedTeamIds: _toggleSetItem(
          state.selectedTeamIds,
          event.team.id,
        ),
      );
    }
    //User selected another team
    if (event is TeamSelectionChanged) {
      yield state.copyWith(
        selectedTeamId: event.teamId,
        filteredMembers: _filterMembers(state.allMembers, event.teamId, state.searchQuery),
      );
    }
    //User selected (or deselected) specific member
    if (event is MemberListItemTapped) {
      yield state.copyWith(
        selectedMemberIds: _toggleSetItem(
            state.selectedMemberIds,
            TeamMemberIdPair(
              memberId: event.member.userId,
              teamId: event.member.teamId,
            )),
      );
    }
    //Search view opened or closed
    if (event is SearchVisibilityChanged) {
      if (state.currentTab == MemberPickerTab.members) {
        yield state.copyWith(
          isSearchVisible: event.visible,
          searchQuery: '',
          filteredMembers: _filterMembers(state.allMembers, state.selectedTeamId, ''),
        );
      }
      if (state.currentTab == MemberPickerTab.teams) {
        yield state.copyWith(
          isSearchVisible: event.visible,
          searchQuery: '',
          filteredTeams: _filterTeams(state.allTeams, ''),
        );
      }
    }
    //Search query changed
    if (event is SearchTextChanged) {
      if (state.currentTab == MemberPickerTab.members) {
        yield state.copyWith(
          searchQuery: event.text,
          filteredMembers: _filterMembers(state.allMembers, state.selectedTeamId, event.text),
        );
      }
      if (state.currentTab == MemberPickerTab.teams) {
        yield state.copyWith(
          searchQuery: event.text,
          filteredTeams: _filterTeams(state.allTeams, event.text),
        );
      }
    }
    //User selected another team for email
    if (event is EmailTeamSelectionChanged) {
      yield state.copyWith(
        selectedEmailTeamId: event.teamId,
      );
    }
    //Email field changed
    if (event is EmailChanged) {
      yield state.copyWith(
        email: event.text,
      );
    }
    //Email added to list
    if (event is AddEmailPressed) {
      if (state.emailTeams != null) {
        if (state.email.isNotEmpty && state.emailTeams!.any((t) => t.id == state.selectedEmailTeamId)) {
          if (state.emailList.any((m) => m.teamId == state.selectedEmailTeamId && m.email == state.email)) {
            yield state.copyWith(
              email: '',
            );
          } else {
            yield state.copyWith(
              emailList: state.emailList.rebuild((b) => b.add(TeamMember.email(
                    email: state.email,
                    team: state.emailTeams!.firstWhere((t) => t.id == state.selectedEmailTeamId),
                  ))),
              email: '',
            );
          }
        }
      }
    }
    //Email added to list
    if (event is EmailItemDeletePressed) {
      yield state.copyWith(
        emailList: state.emailList
            .rebuild((b) => b.removeWhere((m) => m.teamId == event.member.teamId && m.email == event.member.email)),
      );
    }
    //User confirmed selection
    if (event is SelectionConfirmed) {
      switch (state.currentTab) {
        case MemberPickerTab.teams:
        case MemberPickerTab.members:
          if (state.selectedMemberIds != state.initialSelectedMemberIds || state.selectedTeamIds != state.initialSelectedTeamIds) {
            final List<TeamMember> membersToSend = [];
            final List<TeamMember> initialMembersToSend = [];
            List<TeamMember> generateMembers(BuiltSet<TeamMemberIdPair> pair) {
              return pair
                  .map<TeamMember?>((id) {
                final findings = state.allMembers.where((m) => m.userId == id.memberId && m.teamId == id.teamId);
                return findings.isNotEmpty ? findings.first : null;
              })
                  .where((t) => t != null)
                  .map((t) => t!)
                  .toList();
            }
            final selectedMembers = generateMembers(state.selectedMemberIds);
            final initialSelectedMembers = generateMembers(state.initialSelectedMemberIds);

            List<TeamMember> generateTeams(BuiltSet<int> pair) {
              return pair
                  .map<TeamMember?>((id) {
                final findings = state.allTeams?.where((t) => t.id == id).toList() ?? [];
                return findings.isNotEmpty ? TeamMember.entireTeam(team: findings.first) : null;
              })
                  .where((t) => t != null)
                  .map((t) => t!)
                  .toList();
            }

            final List<TeamMember> selectedTeams = generateTeams(state.selectedTeamIds);
            final List<TeamMember> initialSelectedTeams = generateTeams(state.initialSelectedTeamIds);
            membersToSend.addAll(selectedMembers);
            membersToSend.addAll(selectedTeams);
            initialMembersToSend.addAll(initialSelectedMembers);
            initialMembersToSend.addAll(initialSelectedTeams);

            // for (TeamMember team in selectedTeams) {
            //   final BuiltList<TeamMember> findMembers = _filterMembers(state.allMembers, team.teamId, '');
            //   for (TeamMember foundMember in findMembers) {
            //     if (!membersToSend.contains(foundMember)) {
            //       membersToSend.add(foundMember);
            //     }
            //   }
            // }
            yield SelectionConfirmedState.from(
              state,
              selectedMembers: membersToSend,
              initialSelectedTeamsAndMembers: initialMembersToSend,
            );
          }
          break;
        case MemberPickerTab.email:
          if (state.emailList.isNotEmpty || state.email.isNotEmpty && state.emailTeams != null) {
            final members = state.emailList.toList() +
                (state.email.isNotEmpty
                    ? [
                        TeamMember.email(
                          email: state.email,
                          team: state.emailTeams!.firstWhere((t) => t.id == state.selectedEmailTeamId),
                        )
                      ]
                    : <TeamMember>[]);
            if (members.isNotEmpty) {
              yield state.copyWith(isLoading: true);
              _processNewMembers(members);
            }
          }
          break;
      }
    }
    //Emails finished processing
    if (event is EmailsFinishedProcessing) {
      yield MembersProcessedState.from(
        state.copyWith(isLoading: false),
        isProcessingSuccess: event.isSuccess,
        processedMembers: event.processedMembers,
        unprocessedEmails: event.newEmails,
      );
    }
    //Session expired
    if (event is SessionExpired) {
      yield SessionExpiredState.from(state);
    }

    if (event is ConnectionErrorEvent) {
      yield ConnectionErrorState.from(state, errorMessage: event.errorMessage);
    }
  }
*/

  //--------------------------------------------------------------------------------------------------------------------

  /// Load list of teams current user is part of and all their members
  Future<void> _loadTeamsAndMembers() async {
    _server.loadTeamsAndMembers(
      excludeCurrentUser: true,
      checkSharingOptions: _checkSharingOptions,
      loadAvatars: true,
      onSuccess: (teams, members) {
        add(MembersLoaded(isSuccess: true, teams: teams, members: members));
      },
      onError: (error) {
        if (error.isSessionExpired) {
          add(SessionExpired());
        } else if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(const MembersLoaded(isSuccess: false));
        }
      },
    );
  }

  /// Return sublist of all members based on specified filters
  BuiltList<TeamMember> _filterMembers(
    BuiltList<TeamMember> members,
    int selectedTeamId,
    String searchQuery,
  ) {
    final ListBuilder<TeamMember> builder = members.toBuilder();

    builder.removeWhere((team) => team.isAdmin == true);
    builder.removeWhere((team) => team.isApproved == false);

    builder.removeWhere(
      (team) => team.isAdmin == false && team.teamOnlyAdminShare == true,
    );

    if (searchQuery.isNotEmpty) {
      builder.retainWhere(
        (m) =>
            m.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().startsWith(searchQuery.toLowerCase()),
      );
    } else if (selectedTeamId > -1) {
      builder.retainWhere((m) => m.teamId == selectedTeamId);
    }

    return builder.build();
  }

  /// Return sublist of all teams based on specified filters
  BuiltList<Team> _filterTeams(BuiltList<Team>? teams, String searchQuery) {
    if (teams == null) {
      return BuiltList.from(<Team>[]);
    }
    final ListBuilder<Team> builder = teams.toBuilder();

    builder.removeWhere((t) => t.isApproved == false);

    if (searchQuery.isNotEmpty) {
      builder.retainWhere(
        (m) => (m.name).toLowerCase().startsWith(searchQuery.toLowerCase()),
      );
    }
    builder.sort((t1, t2) => t1.name.compareTo(t2.name));
    return builder.build();
  }

  /// Try to retrieve information for new members from the server
  Future<void> _processNewMembers(List<TeamMember> members) async {
    _server.processNewTeamMembers(
      members: members,
      onSuccess: (processedMembers, newEmails) {
        add(
          EmailsFinishedProcessing(
            isSuccess: true,
            processedMembers: processedMembers,
            newEmails: newEmails,
          ),
        );
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(const EmailsFinishedProcessing(isSuccess: false));
        }
      },
    );
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
}
