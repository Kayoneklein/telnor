part of '../index.dart';

///Screen for showing account info
class AccountInfoScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider<AccountInfoBloc>(
      create: (context) => AccountInfoBloc(),
      child: AccountInfoForm(),
    );
  }
}

class AccountInfoForm extends StatefulWidget {
  @override
  State createState() => _AccountInfoFormState();
}

class _AccountInfoFormState extends State<AccountInfoForm> {
  late final AccountInfoBloc _bloc;
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<AccountInfoBloc>(context);
    _newPasswordController.addListener(_onNewPasswordChanged);
    _confirmPasswordController.addListener(_onConfirmPasswordChanged);
  }

  @override
  void dispose() {
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AccountInfoBloc, AccountInfoState>(
      listener: _stateChangeListener,
      child: BlocBuilder<AccountInfoBloc, AccountInfoState>(
        builder: (context, state) {
          if (_newPasswordController.text != state.newPassword) {
            _newPasswordController.value = _newPasswordController.value
                .copyWith(text: state.newPassword);
          }
          if (_confirmPasswordController.text != state.confirmPassword) {
            _confirmPasswordController.value = _confirmPasswordController.value
                .copyWith(text: state.confirmPassword);
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(Strings.accountInfoTitle),
              centerTitle: false,
              leading: PopScope(
                canPop: false,
                onPopInvokedWithResult: (bool? pop, result) {
                  _backButtonPressed(context);
                },
                child: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => _backButtonPressed(context),
                ),
              ),
              actions: state.isInitialized
                  ? [
                      IconButton(
                        icon: const Icon(Icons.check),
                        tooltip: Strings.actionConfirm,
                        onPressed: () {
                          if (!state.isLoading) {
                            _confirmButtonPressed(context);
                          }
                        },
                      ),
                    ]
                  : [],
            ),
            body: Stack(
              children: <Widget>[
                if (state.isInitialized)
                  Scrollbar(
                    child: SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              Strings.accountInfoNewPassword,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            TextFormField(
                              controller: _newPasswordController,
                              autovalidateMode: AutovalidateMode.always,
                              validator: (_) => state.isNewPasswordValid
                                  ? null
                                  : Strings.accountInfoNewPasswordEmpty,
                              style: Theme.of(context).textTheme.headlineSmall,
                              textInputAction: TextInputAction.next,
                              obscureText: true,
                              onFieldSubmitted: (v) {
                                FocusScope.of(context).nextFocus();
                              },
                            ),
                            const SizedBox(height: 24.0),
                            Text(
                              Strings.accountInfoConfirmPassword,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            TextFormField(
                              controller: _confirmPasswordController,
                              autovalidateMode: AutovalidateMode.always,
                              validator: (_) => state.isConfirmPasswordValid
                                  ? null
                                  : Strings.accountInfoConfirmPasswordDifferent,
                              style: Theme.of(context).textTheme.headlineSmall,
                              textInputAction: TextInputAction.done,
                              obscureText: true,
                              onFieldSubmitted: (v) {
                                FocusScope.of(context).unfocus();
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                if (state.isLoading) const LinearProgressIndicator(),
              ],
            ),
          );
        },
      ),
    );
  }

  /// Triggers when state changes
  Future<void> _stateChangeListener(
    BuildContext context,
    AccountInfoState state,
  ) async {
    if (state is ShowDiscardDialogState) {
      final bool? isYes =
          await showDialog<bool?>(
            context: context,
            builder: (BuildContext dialogContext) {
              return AlertDialog(
                content: Text(Strings.accountInfoDiscardChanges),
                actions: <Widget>[
                  TextButton(
                    child: Text(Strings.actionNo.toUpperCase()),
                    onPressed: () {
                      Navigator.of(dialogContext).pop(false);
                    },
                  ),
                  TextButton(
                    child: Text(Strings.actionYes.toUpperCase()),
                    onPressed: () {
                      Navigator.of(dialogContext).pop(true);
                    },
                  ),
                ],
              );
            },
          ) ??
          false;
      _bloc.add(DialogConfirmationReceived(isYes: isYes ?? false));
    }
    if (state is AccountInfoSavedState) {
      if (state.isSuccess) {
        //BlocProvider.of<AuthenticationBloc>(context).add(UserInfoChangedEvent());
        Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(Strings.accountInfoSaveError)));
      }
    }
    if (state is SessionExpiredState) {
      BlocProvider.of<AuthenticationBloc>(context).add(SessionExpiredEvent());
    }
    if (state is ConnectionErrorState) {
      // show error dialog
      connectionError(context, state.errorMessage);
    }
    if (state is NavigateBackState) {
      Navigator.of(context).pop();
    }
  }

  void _onNewPasswordChanged() {
    _bloc.add(NewPasswordChanged(newPassword: _newPasswordController.text));
  }

  void _onConfirmPasswordChanged() {
    _bloc.add(
      ConfirmPasswordChanged(confirmPassword: _confirmPasswordController.text),
    );
  }

  void _confirmButtonPressed(BuildContext context) {
    FocusScope.of(context).unfocus();
    _bloc.add(ChangesConfirmed());
  }

  void _backButtonPressed(BuildContext context) {
    FocusScope.of(context).unfocus();
    _bloc.add(BackButtonPressed());
  }
}
