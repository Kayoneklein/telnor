part of '../../index.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  DateTime _lastBackPressedTime = DateTime.now();
  bool canPop = false;
  bool readOnlyMode = false;

  Future<void> _initReadOnly() async {
    readOnlyMode = await Preferences().readonlyMode ?? false;
  }

  @override
  void initState() {
    super.initState();
    _initReadOnly();
  }

  @override
  Widget build(BuildContext context) {
    final remoteConfig = BlocProvider.of<ConfigurationBloc>(
      context,
    ).state.configuration;

    return PopScope(
      canPop: canPop,
      onPopInvokedWithResult: (bool? pop, result) {
        _onBackPressed();
        if (canPop) {
          BlocProvider.of<auth.AuthenticationBloc>(
            context,
          ).add(auth.SessionExpiredEvent());
        }
      },
      child: MultiBlocProvider(
        providers: [
          BlocProvider<TabBloc>(create: (context) => TabBloc()),
          BlocProvider<PasswordsBloc>(
            create: (context) {
              return PasswordsBloc(
                isPremium: BlocProvider.of<auth.AuthenticationBloc>(
                  context,
                ).isPremiumFeaturesAvailable,
                configuration: remoteConfig,
                authBloc: BlocProvider.of<auth.AuthenticationBloc>(context),
              );
            },
          ),
          BlocProvider<MessagesBloc>(create: (context) => MessagesBloc()),
          BlocProvider<NotificationsBloc>(
            create: (context) => NotificationsBloc(),
          ),
        ],
        child: BlocConsumer<auth.AuthenticationBloc, auth.AuthenticationState>(
          listener: (ctx, authState) {
            if (authState is auth.SessionExpired) {
              Navigator.popUntil(context, ModalRoute.withName('/'));
              BlocProvider.of<auth.AuthenticationBloc>(
                context,
              ).add(auth.SignedOutEvent());
            }
          },
          builder: (ctx, authState) {
            return BlocBuilder<TabBloc, AppTab>(
              builder: (context, activeTab) {
                return Scaffold(
                  appBar: _appBarForTab(activeTab),
                  drawer: ApplicationDrawer(),
                  endDrawer: _endDrawerForTab(activeTab),
                  drawerEdgeDragWidth: 0.0,
                  body: _bodyForTab(activeTab),
                  bottomNavigationBar: Builder(
                    builder: (context) {
                      return HomeTabSelector(
                        tabs: <AppTab>[
                          AppTab.passwords,
                          if (BlocProvider.of<auth.AuthenticationBloc>(
                                context,
                              ).isVerifiedFeaturesAvailable &&
                              !remoteConfig.disableMessages)
                            AppTab.messages,
                          AppTab.notifications,
                        ],
                        activeTab: activeTab,
                        onTabSelected: (AppTab tab) {
                          if (Scaffold.of(context).isDrawerOpen) {
                            Navigator.pop(context);
                          }
                          BlocProvider.of<TabBloc>(context).add(UpdateTab(tab));
                          if (tab == AppTab.notifications) {
                            BlocProvider.of<NotificationsBloc>(
                              context,
                            ).add(NotificationsTabOpened());
                          }
                        },
                      );
                    },
                  ),
                  floatingActionButton: _fabForTab(activeTab),
                );
              },
            );
          },
        ),
      ),
    );
  }

  PreferredSizeWidget _appBarForTab(AppTab activeTab) {
    switch (activeTab) {
      case AppTab.passwords:
        return PasswordsAppBar();
      case AppTab.messages:
        return MessagesAppBar();
      case AppTab.notifications:
        return AppBar(title: Text(Strings.notificationsTitle));
    }
  }

  Widget? _fabForTab(AppTab activeTab) {
    switch (activeTab) {
      case AppTab.passwords:
        return BlocBuilder<PasswordsBloc, PasswordsState>(
          builder: (context, state) {
            if (state.isPasswordsAvailable) {
              return FloatingActionButton(
                backgroundColor: readOnlyMode ? Colors.grey : null,
                onPressed: () =>
                    _addNewPassword(context, state.totalFilesUploaded),
                child: const Icon(Icons.add),
              );
            } else {
              return const SizedBox();
            }
          },
        );
      case AppTab.messages:
        return BlocBuilder<MessagesBloc, MessagesState>(
          builder: (context, state) {
            if (state.isMessagesAvailable) {
              return FloatingActionButton(
                child: const Icon(Icons.message),
                onPressed: () => _addNewMessage(context),
              );
            } else {
              return const SizedBox();
            }
          },
        );
      default:
        return null;
    }
  }

  Widget? _endDrawerForTab(AppTab activeTab) {
    switch (activeTab) {
      case AppTab.passwords:
        return PasswordsShareInfoDrawer();
      default:
        return null;
    }
  }

  Widget _bodyForTab(AppTab activeTab) {
    switch (activeTab) {
      case AppTab.passwords:
        return PasswordsScreen();
      case AppTab.messages:
        return MessagesScreen();
      case AppTab.notifications:
        return NotificationsScreen();
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Initiate new password creation screen
  Future<void> _addNewPassword(
    BuildContext context,
    int totalFilesAttached,
  ) async {
    final readOnly = await Preferences().readonlyMode;
    if (readOnly == true) {
      Fluttertoast.showToast(msg: Strings.readOnlyToastAlert);
      return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute<Password>(
        builder: (context) =>
            PasswordEditScreen(totalFilesAttached: totalFilesAttached),
      ),
    );
    if (result != null) {
      BlocProvider.of<PasswordsBloc>(
        context,
      ).add(PasswordAddPressed(password: result));
    }
  }

  /// Initiate new message creation screen
  Future<void> _addNewMessage(BuildContext context) async {
    final members = await Navigator.push(
      context,
      MaterialPageRoute<MemberPickerModel>(
        builder: (context) => const MemberPickerScreen(),
      ),
    );
    if (members != null) {
      final result = await Navigator.push(
        context,
        MaterialPageRoute<MessageResult>(
          builder: (context) =>
              MessageEditScreen(members: members.membersToSend),
        ),
      );
      if (result is MessageSendResult) {
        BlocProvider.of<MessagesBloc>(
          context,
        ).add(MessageSendPressed(message: result.message));
      }
    }
  }

  bool _onBackPressed() {
    final difference = DateTime.now().difference(_lastBackPressedTime);
    _lastBackPressedTime = DateTime.now();
    if (difference >= const Duration(milliseconds: 700)) {
      canPop = false;
      return false;
    } else {
      SystemNavigator.pop(animated: true);
      canPop = true;
      return true;
    }
  }
}
