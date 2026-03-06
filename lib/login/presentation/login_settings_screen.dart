part of '../index.dart';

///Screen for showing app settings
class LoginSettingsScreen extends StatelessWidget {
  const LoginSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return LoginSettingsForm();
  }
}

class LoginSettingsForm extends StatefulWidget {
  const LoginSettingsForm({super.key});

  @override
  State createState() => _LoginSettingsFormState();
}

class _LoginSettingsFormState extends State<LoginSettingsForm> {
  late final LoginSettingsBloc _bloc;
  final _serverController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<LoginSettingsBloc>(context);
    _serverController.addListener(() => _serverUrlChanged());
    _bloc.add(const ToggleLoginSettingIsLoading(isLoading: false));

    _initPreferences();
  }

  Future<void> _initPreferences() async {
    final String? customServerUrl = await Preferences().customServerUrl;
    final isCustomServer = await Preferences().isCustomServer;

    if (customServerUrl != null && customServerUrl.isNotEmpty == true) {
      _bloc.add(CustomServerUrlChanged(url: customServerUrl));
    }

    _bloc.add(ServerSelectionChanged(isCustomServer: isCustomServer));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<LoginSettingsBloc, LoginSettingsState>(
      listener: _stateChangeListener,
      child: BlocBuilder<LoginSettingsBloc, LoginSettingsState>(
        builder: (context, state) {
          if (state.customServerUrl != _serverController.text) {
            _serverController.text = state.customServerUrl;
          }

          return Form(
            child: PopScope(
              canPop: false,
              onPopInvokedWithResult: (bool canPop, val) {
                _backButtonPressed();
                // return false;
              },
              child: Scaffold(
                appBar: AppBar(
                  title: Text(Strings.loginSettingsTitle),
                  leading: IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => _backButtonPressed(),
                  ),
                  actions: state.isInitialized
                      ? [
                          if (!state.isLoading)
                            IconButton(
                              icon: const Icon(Icons.check),
                              tooltip: Strings.actionConfirm,
                              onPressed: _confirmButtonPressed,
                            ),
                        ]
                      : [],
                ),
                body: Stack(
                  children: <Widget>[
                    if (state.isInitialized)
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const SizedBox(height: 24.0),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12.0,
                            ),
                            child: Text(
                              Strings.loginSettingsChooseServer,
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                          ),
                          const SizedBox(height: 8.0),
                          InkWell(
                            child: Row(
                              children: <Widget>[
                                IgnorePointer(
                                  child: RadioGroup(
                                    onChanged: (value) {},
                                    groupValue: state.isCustomServer,
                                    child: Radio<bool>(value: false),
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Text(
                                        Strings.loginSettingsDefaultServer,
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 1,
                                        style: Theme.of(
                                          context,
                                        ).textTheme.bodyMedium,
                                      ),
                                      Text(
                                        WebProvider.DEFAULT_SERVER,
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 1,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge
                                            ?.copyWith(color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            onTap: () => _serverSelectionChanged(false),
                          ),
                          InkWell(
                            child: Row(
                              children: <Widget>[
                                IgnorePointer(
                                  child: RadioGroup(
                                    groupValue: state.isCustomServer,
                                    onChanged: (value) {},
                                    child: Radio<bool>(value: true),
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    Strings.loginSettingsCustomServer,
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 1,
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodyMedium,
                                  ),
                                ),
                              ],
                            ),
                            onTap: () => _serverSelectionChanged(true),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                            ),
                            child: TextFormField(
                              autovalidateMode: AutovalidateMode.always,
                              validator: (_) => state.isCustomServerUrlValid
                                  ? null
                                  : state.customServerUrl.isEmpty
                                  ? Strings.loginSettingsErrorEmptyUrl
                                  : Strings.loginSettingsErrorInvalidUrl,
                              controller: _serverController,
                              keyboardType: TextInputType.url,
                              enabled: state.isCustomServer,
                              style: state.isCustomServer
                                  ? Theme.of(context).textTheme.bodyMedium
                                  : Theme.of(context).textTheme.bodyMedium
                                        ?.copyWith(color: Colors.grey),
                            ),
                          ),
                        ],
                      ),
                    if (state.isLoading) const LinearProgressIndicator(),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  /// Triggers when state changes
  Future<void> _stateChangeListener(
    BuildContext context,
    LoginSettingsState state,
  ) async {
    if (state.customServerUrl != _serverController.text) {
      _serverController.text = state.customServerUrl;
    }

    if (state is ShowDiscardDialogState) {
      // SnackBar()
      // final bool? isYes = await showDialog<bool>(
      //         context: context,
      //         builder: (BuildContext dialogContext) {
      //           return AlertDialog(
      //             content: Text(Strings.loginSettingsDiscardChanges),
      //             actions: <Widget>[
      //               TextButton(
      //                 child: Text(Strings.actionNo.toUpperCase()),
      //                 onPressed: () {
      //                   Navigator.of(dialogContext).pop(false);
      //                 },
      //               ),
      //               TextButton(
      //                 child: Text(Strings.actionYes.toUpperCase()),
      //                 onPressed: () {
      //                   Navigator.of(dialogContext).pop(true);
      //                 },
      //               ),
      //             ],
      //           );
      //         }) ??
      //     false;

      // _bloc.add(DialogConfirmationReceived(isYes: isYes ?? false));
    }

    if (state is NavigateBackState) {
      BlocProvider.of<ConfigurationBloc>(context).add(ReloadRequested());
      Navigator.of(context).pop();
    }

    if (state is ScreenIsBusyState) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'We are currently saving your server configuration. Please wait',
          ),
        ),
      );
    }

    if (state is ShowInvalidCustomUrlDialogState) {
      showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Undefined URL'),
            content: const Text('Please enter another URL'),
            actions: [
              TextButton(
                child: const Text('OK'),
                onPressed: () {
                  Navigator.of(context).pop(false);
                },
              ),
            ],
          );
        },
      );
    }
    if (state is ConnectionErrorState) {
      showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            content: Text(state.errorMessage),
            actions: [
              TextButton(
                child: Text(Strings.actionOk),
                onPressed: () {
                  Navigator.of(context).pop(false);
                },
              ),
            ],
          );
        },
      );
    }
  }

  /// Triggers when server selection changes
  void _serverSelectionChanged(bool value) {
    _bloc.add(ServerSelectionChanged(isCustomServer: value));
  }

  /// Triggers when custom server input changes
  void _serverUrlChanged() {
    _bloc.add(CustomServerUrlChanged(url: _serverController.text));
  }

  /// Triggers when user presses 'Confirm' button
  void _confirmButtonPressed() {
    _bloc.add(ChangesConfirmed());
  }

  void _backButtonPressed() {
    _bloc.add(BackButtonPressed());
  }
}
