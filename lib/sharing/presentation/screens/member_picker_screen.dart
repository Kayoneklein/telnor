part of '../../index.dart';

/// Screen for picking list of members
class MemberPickerScreen extends StatelessWidget {
  const MemberPickerScreen({
    bool checkSharingOptions = false,
    Iterable<int>? pickedTeams,
    Iterable<TeamMemberIdPair>? pickedMembers,
  }) : _checkSharingOptions = checkSharingOptions,
       _initialPickedTeams = pickedTeams,
       _initialPickedMembers = pickedMembers;

  final bool _checkSharingOptions;
  final Iterable<int>? _initialPickedTeams;
  final Iterable<TeamMemberIdPair>? _initialPickedMembers;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<MemberPickerBloc>(
      create: (context) => MemberPickerBloc(
        checkSharingOptions: _checkSharingOptions,
        pickedTeams: _initialPickedTeams,
        pickedMembers: _initialPickedMembers,
      ),
      child: _MemberPickerContent(),
    );
  }
}

class _MemberPickerContent extends StatefulWidget {
  @override
  State createState() => _MemberPickerContentState();
}

class _MemberPickerContentState extends State<_MemberPickerContent> {
  late final MemberPickerBloc _bloc;
  final _searchController = TextEditingController();
  final _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<MemberPickerBloc>(context);
    _searchController.addListener(
      () => _bloc.add(SearchTextChanged(text: _searchController.text)),
    );
    _emailController.addListener(
      () => _bloc.add(EmailChanged(text: _emailController.text)),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<MemberPickerBloc, MemberPickerState>(
      listener: _stateListener,
      child: BlocBuilder<MemberPickerBloc, MemberPickerState>(
        builder: (context, state) {
          if (_searchController.text != state.searchQuery) {
            if (state.searchQuery.isEmpty) {
              _searchController.clear();
            } else {
              _searchController.value.copyWith(text: state.searchQuery);
            }
          }
          if (_emailController.text != state.email) {
            if (state.email.isEmpty) {
              _emailController.clear();
            } else {
              _emailController.value = _emailController.value.copyWith(
                text: state.email,
              );
            }
          }
          return Scaffold(
            appBar: _buildAppBar(context, state),
            body: Stack(
              children: <Widget>[
                _buildBody(context, state),
                if (state.isLoading) const LinearProgressIndicator(),
              ],
            ),
            bottomNavigationBar: _TabSelector(
              activeTab: state.currentTab,
              onTabSelected: (tab) {
                _bloc.add(TabSelectionChanged(tab: tab));
              },
            ),
          );
        },
      ),
    );
  }

  /// Listener for state changes
  void _stateListener(BuildContext context, MemberPickerState state) {
    if (state is SessionExpiredState) {
      BlocProvider.of<AuthenticationBloc>(context).add(SessionExpiredEvent());
    }
    if (state is ConnectionErrorState) {
      // show error dialog
      connectionError(context, state.errorMessage);
    }
    if (state is SelectionConfirmedState) {
      final result = MemberPickerModel(
        initialMembersToSend: state.initialSelectedTeamsAndMembers,
        membersToSend: state.selectedMembers,
      );
      Navigator.of(context).pop<MemberPickerModel>(result);
    }
    if (state is MembersProcessedState) {
      if (state.isProcessingSuccess &&
          state.processedMembers != null &&
          state.unprocessedEmails != null) {
        if (state.unprocessedEmails!.isEmpty) {
          Navigator.of(context).pop<MemberPickerModel>(
            MemberPickerModel(
              initialMembersToSend: [],
              membersToSend: state.processedMembers!,
            ),
          );
        } else {
          showUnprocessedWarningDialog(
            state.processedMembers!,
            state.unprocessedEmails!,
          );
        }
      } else {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(content: Text(Strings.memberPickerEmailProcessingError)),
          );
      }
    }
  }

  /// Show dialog waring about emails non-existent in the system
  Future<void> showUnprocessedWarningDialog(
    List<TeamMember> processedMembers,
    List<String> unprocessedEmails,
  ) async {
    await showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(Strings.memberPickerEmailUnprocessedTitle),
          content: Text(
            Strings.memberPickerEmailUnprocessedMessage +
                '\n\n' +
                unprocessedEmails.map((s) => '- ' + s).join('\n'),
          ),
          actions: [
            TextButton(
              child: Text(Strings.actionOk.toUpperCase()),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
    Navigator.of(context).pop<MemberPickerModel>(
      MemberPickerModel(
        initialMembersToSend: [],
        membersToSend: processedMembers,
      ),
    );
  }

  /// Build top navigation bar
  AppBar _buildAppBar(BuildContext context, MemberPickerState state) {
    if (state.isSearchVisible) {
      return AppBar(
        title: PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool? pop, result) {
            _bloc.add(const SearchVisibilityChanged(visible: false));
          },
          child: TextField(
            controller: _searchController,
            autofocus: true,
            style: Theme.of(context).primaryTextTheme.headlineSmall,
            cursorColor:
                Theme.of(context).primaryTextTheme.bodyMedium?.color ??
                Colors.black,
            decoration: InputDecoration(
              hintText: Strings.actionSearch,
              hintStyle: Theme.of(context).primaryTextTheme.bodyMedium,
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color:
                      Theme.of(context).primaryTextTheme.bodyMedium?.color ??
                      Colors.black,
                ),
              ),
            ),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: Strings.actionClose,
          onPressed: () {
            _bloc.add(const SearchVisibilityChanged(visible: false));
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear),
            tooltip: Strings.actionClear,
            onPressed: () {
              _bloc.add(const SearchTextChanged(text: ''));
            },
          ),
        ],
      );
    } else {
      String title;
      switch (state.currentTab) {
        case MemberPickerTab.teams:
          if (state.allTeams != null) {
            title =
                '${Strings.memberPickerTeamsTitle}: ${state.selectedTeamIds.length}';
          } else {
            title = Strings.memberPickerTeamsTitle;
          }
          break;
        case MemberPickerTab.members:
          if (state.allTeams != null) {
            title =
                '${Strings.memberPickerMembersTitle}: ${state.selectedMemberIds.length}';
          } else {
            title = Strings.memberPickerMembersTitle;
          }
          break;
        case MemberPickerTab.email:
          if (state.emailTeams != null) {
            title =
                '${Strings.memberPickerMembersTitle}: ${state.emailList.length}';
          } else {
            title = Strings.memberPickerMembersTitle;
          }
          break;
      }
      return AppBar(
        title: Text(title),
        automaticallyImplyLeading: true,
        actions: (state.allTeams != null)
            ? <Widget>[
                if (state.currentTab == MemberPickerTab.teams ||
                    state.currentTab == MemberPickerTab.members)
                  IconButton(
                    icon: const Icon(Icons.search),
                    tooltip: Strings.actionSearch,
                    onPressed: () {
                      _bloc.add(const SearchVisibilityChanged(visible: true));
                    },
                  ),
                IconButton(
                  icon: const Icon(Icons.check),
                  tooltip: Strings.actionConfirm,
                  onPressed: () {
                    _bloc.add(SelectionConfirmed());
                  },
                ),
              ]
            : [],
      );
    }
  }

  /// Build screen body
  Widget _buildBody(BuildContext context, MemberPickerState state) {
    switch (state.currentTab) {
      case MemberPickerTab.teams:
        return _buildTeamsPage(context, state);
      case MemberPickerTab.members:
        return _buildMembersPage(context, state);
      case MemberPickerTab.email:
        return _buildEmailPage(context, state);
    }
  }

  /// Build content of the 'Teams' tab body
  Widget _buildTeamsPage(BuildContext context, MemberPickerState state) {
    if (state.isLoadingError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Text(
              Strings.memberPickerErrorLoad,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              child: Text(Strings.actionRetry.toUpperCase()),
              onPressed: () {
                _bloc.add(RetryPressed());
              },
            ),
          ],
        ),
      );
    }
    if (state.allTeams == null) {
      return const SizedBox(height: 0.0);
    }
    if (state.allTeams!.isEmpty) {
      return NoDataAvailable(
        icon: Icons.people,
        title: Strings.memberPickerEmptyTitle,
        message: Strings.memberPickerEmptyMessage,
      );
    }
    return Column(
      children: <Widget>[
        Expanded(
          child: state.filteredTeams.isNotEmpty
              ? TeamsList(
                  teams: state.filteredTeams.toList(),
                  onItemClicked: (_, item) {
                    _bloc.add(TeamListItemTapped(team: item));
                  },
                  selectedIds: state.selectedTeamIds.toSet(),
                )
              : NoDataAvailable(
                  icon: Icons.people,
                  title: Strings.memberPickerEmptyTitle,
                  message: Strings.memberPickerEmptyMessage,
                ),
        ),
      ],
    );
  }

  /// Build content of the 'Members' tab body
  Widget _buildMembersPage(BuildContext context, MemberPickerState state) {
    if (state.isLoadingError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Text(
              Strings.memberPickerErrorLoad,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              child: Text(Strings.actionRetry.toUpperCase()),
              onPressed: () {
                _bloc.add(RetryPressed());
              },
            ),
          ],
        ),
      );
    }
    if (state.allTeams == null) {
      return const SizedBox(height: 0.0);
    }
    if (state.allTeams!.isEmpty) {
      return NoDataAvailable(
        icon: Icons.people,
        title: Strings.memberPickerEmptyTitle,
        message: Strings.memberPickerEmptyMessage,
      );
    }
    return Column(
      children: <Widget>[
        if (!state.isSearchVisible)
          TeamPicker(
            teams: state.allTeams!.toList(),
            includeAllTeams: true,
            selectedTeamId: state.selectedTeamId,
            onSelectionChanged: (value) {
              if (value != null) {
                _bloc.add(TeamSelectionChanged(teamId: value));
              }
            },
          ),
        if (!state.isSearchVisible) const SizedBox(height: 4.0),
        Expanded(
          child: state.filteredMembers.isNotEmpty
              ? MembersList(
                  members: state.filteredMembers.toList(),
                  onItemClicked: (_, item) {
                    _bloc.add(MemberListItemTapped(member: item));
                  },
                  selectedIds: state.selectedMemberIds.toSet(),
                  showTeamNames: state.selectedTeamId == -1,
                )
              : NoDataAvailable(
                  icon: Icons.people,
                  title: Strings.memberPickerEmptyTitle,
                  message: Strings.memberPickerEmptyMessage,
                ),
        ),
      ],
    );
  }

  /// Build content of the 'Email' tab body
  Widget _buildEmailPage(BuildContext context, MemberPickerState state) {
    if (state.isLoadingError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Text(
              Strings.memberPickerErrorLoad,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              child: Text(Strings.actionRetry.toUpperCase()),
              onPressed: () {
                _bloc.add(RetryPressed());
              },
            ),
          ],
        ),
      );
    }
    if (state.emailTeams == null) {
      return const SizedBox(height: 0.0);
    }
    if (state.emailTeams!.isEmpty) {
      return NoDataAvailable(
        icon: Icons.people,
        title: Strings.memberPickerEmailEmptyTitle,
        message: Strings.memberPickerEmailEmptyMessage,
      );
    }
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      mainAxisSize: MainAxisSize.max,
      children: <Widget>[
        if (!state.isSearchVisible)
          TeamPicker(
            teams: state.emailTeams!.toList(),
            includeAllTeams: false,
            selectedTeamId: state.selectedEmailTeamId,
            onSelectionChanged: (value) {
              if (value != null) {
                _bloc.add(EmailTeamSelectionChanged(teamId: value));
              }
            },
          ),
        Material(
          elevation: 4.0,
          child: Padding(
            padding: const EdgeInsets.only(
              left: 16.0,
              right: 4.0,
              top: 4.0,
              bottom: 4.0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Text(Strings.memberPickerEmail),
                const SizedBox(width: 16.0),
                Expanded(
                  child: TextFormField(
                    controller: _emailController,
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 1,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      isDense: true,
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add),
                  tooltip: Strings.memberPickerAddMember,
                  onPressed: () {
                    _bloc.add(AddEmailPressed());
                  },
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: EmailList(
            members: state.emailList.toList(),
            onItemDeleted: (_, item) {
              _bloc.add(EmailItemDeletePressed(member: item));
            },
          ),
        ),
      ],
    );
  }
}
//======================================================================================================================

/// Widget for switching between tabs
class _TabSelector extends StatelessWidget {
  const _TabSelector({required this.activeTab, required this.onTabSelected});

  final MemberPickerTab activeTab;
  final Function(MemberPickerTab) onTabSelected;

  @override
  Widget build(BuildContext context) {
    final items = <BottomNavigationBarItem>[
      BottomNavigationBarItem(
        icon: const Icon(Icons.people),
        label: Strings.memberPickerTabTeams,
      ),
      BottomNavigationBarItem(
        icon: const Icon(Icons.person),
        label: Strings.memberPickerTabMembers,
      ),
      BottomNavigationBarItem(
        icon: const Icon(Icons.email),
        label: Strings.memberPickerTabEmail,
      ),
    ];
    return BottomNavigationBar(
      currentIndex: MemberPickerTab.values.indexOf(activeTab),
      onTap: (index) => onTabSelected(MemberPickerTab.values[index]),
      items: items,
    );
  }
}

class MemberPickerModel {
  const MemberPickerModel({
    required this.initialMembersToSend,
    required this.membersToSend,
  });

  final List<TeamMember> membersToSend;
  final List<TeamMember> initialMembersToSend;
}
