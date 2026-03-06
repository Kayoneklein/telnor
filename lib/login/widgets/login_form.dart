part of '../index.dart';

/// Widget that shows login form and performs interaction with Bloc
class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  late final LoginBloc _loginFormBloc;
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final Settings _settings = Settings.get;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();

    _loginFormBloc = BlocProvider.of<LoginBloc>(context);

    _usernameController.addListener(_onUsernameChanged);
    _passwordController.addListener(_onPasswordChanged);

    _addBiometricPreference();

    BiometricsService.get.checkDeviceSupported().then((deviceSupported) {
      _loginFormBloc.add(
        BiometricsAvailableChanged(
          isDeviceSupported: deviceSupported,
          enabled: BiometricsService.get.canCheckBiometrics,
        ),
      );
    });
  }

  Future<void> _addBiometricPreference() async {
    if (await Preferences().currentServer != WebProvider.DEFAULT_SERVER) {
      _loginFormBloc.add(const AutomaticallyChangeCustomUrl(true));
    }

    final bool? biometricCheckbox = await Preferences().biometricCheckbox;
    _loginFormBloc.add(
      BiometricsCheckedChanged(checked: biometricCheckbox ?? true),
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<LoginBloc, LoginState>(
      listener: (context, state) async {
        // Success
        if (state.loginStatus == LoginStatus.success) {
          await _settings.delete(Settings.LOGOUT_DUE_TO_BIO_AUTH);
          BlocProvider.of<AuthenticationBloc>(context).add(
            SignedInEvent(
              minutesTillAutoLogout: autoLogoutTimerToMinutes(state.autoLogout),
              biometricsEnabled:
                  state.biometricsAvailable && state.biometricsChecked,
            ),
          );
        }
        // Pin code required
        if (state.loginStatus == LoginStatus.pinCodeRequired) {
          _requestPinCode();
        }

        // Errors
        if (state.loginStatus == LoginStatus.unknownUser) {
          _showErrorDialog(Strings.loginErrorUnknownUser);
        } else if (state.loginStatus == LoginStatus.invalidPassword) {
          _showErrorDialog(Strings.loginErrorInvalidPassword);
        } else if (state.loginStatus == LoginStatus.emailNotVerified) {
          _showErrorDialog(Strings.loginErrorEmailNotValidated);
        } else if (state.loginStatus == LoginStatus.otherError) {
          _showErrorDialog(state.errorMessage);
        }
      },
      child: BlocBuilder<LoginBloc, LoginState>(
        builder: (context, state) {
          if (_usernameController.text != state.email) {
            _usernameController.value = _usernameController.value.copyWith(
              text: state.email,
            );
          }

          final remoteConfig = BlocProvider.of<ConfigurationBloc>(
            context,
          ).state.configuration;
          return Stack(
            children: [
              Form(
                key: _formKey,
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return SingleChildScrollView(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: constraints.maxHeight,
                        ),
                        child: IntrinsicHeight(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: AutofillGroup(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: <Widget>[
                                  _EmailTextColumn(_usernameController),
                                  _PasswordColumn(
                                    controller: _passwordController,
                                    visibilityChanged:
                                        _onPasswordVisibilityChanged,
                                    onSubmit: _onSubmitPressed,
                                    state: state,
                                  ),
                                  _AutoLogoutColumn(
                                    state: state,
                                    changeAutoLogoutValue:
                                        _onAutoLogoutValueChanged,
                                    autoLogoutValue: (AutoLogoutTimer v) =>
                                        _autoLogoutValueName(v),
                                  ),
                                  if (state.biometricsAvailable)
                                    _BiometricAuthentication(
                                      state: state,
                                      onBiometricCheckChanged:
                                          _onBiometricsCheckedChanged,
                                    ),
                                  Expanded(
                                    child: _AuthButtons(
                                      onSubmit: _onSubmitPressed,
                                      formKey: _formKey,
                                      remoteConfig: remoteConfig,
                                      state: state,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              if (state.isLoading) _LoadingWidget(state: state),
            ],
          );
        },
      ),
    );
  }

  ///Helper method for showing error dialogs
  Future<void> _showErrorDialog(String message) async {
    await showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(Strings.loginError),
          content: Text(message),
          actions: <Widget>[
            TextButton(
              child: Text(Strings.actionOk),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
    _loginFormBloc.add(ErrorMessageViewed());
  }

  Future<void> _requestPinCode() async {
    final pin = await showEditTextDialog(
      context,
      title: Strings.loginPinRequiredTitle,
      hint: Strings.loginPinRequiredHint,
      emptyMessage: Strings.loginPinRequiredEmpty,
      keyboardType: const TextInputType.numberWithOptions(
        signed: false,
        decimal: false,
      ),
      positiveTitle: Strings.actionOk,
      cancelTitle: Strings.actionCancel,
    );
    _loginFormBloc.add(ErrorMessageViewed());
    if (pin != null) {
      _loginFormBloc.add(FormSubmitted(pin: pin));
    }
  }

  void _onUsernameChanged() {
    _loginFormBloc.add(EmailChanged(email: _usernameController.text));
  }

  void _onPasswordChanged() {
    _loginFormBloc.add(PasswordChanged(password: _passwordController.text));
  }

  void _onPasswordVisibilityChanged() {
    _loginFormBloc.add(PasswordVisibilityChanged());
  }

  void _onAutoLogoutValueChanged(AutoLogoutTimer? newValue) {
    _loginFormBloc.add(
      AutoLogoutValueChanged(value: newValue ?? AutoLogoutTimer.never),
    );
  }

  void _onBiometricsCheckedChanged(bool? checked) {
    _loginFormBloc.add(BiometricsCheckedChanged(checked: checked ?? false));
  }

  void _onSubmitPressed() {
    _loginFormBloc.add(const FormSubmitted());
  }

  String _autoLogoutValueName(AutoLogoutTimer value) {
    switch (value) {
      case AutoLogoutTimer.never:
        return Strings.loginAutoLogoutNever;
      case AutoLogoutTimer.min2:
        return Strings.loginAutoLogoutMin2;
      case AutoLogoutTimer.min5:
        return Strings.loginAutoLogoutMin5;
      case AutoLogoutTimer.min10:
        return Strings.loginAutoLogoutMin10;
      case AutoLogoutTimer.min15:
        return Strings.loginAutoLogoutMin15;
      case AutoLogoutTimer.min30:
        return Strings.loginAutoLogoutMin30;
      case AutoLogoutTimer.hour1:
        return Strings.loginAutoLogoutHour1;
      case AutoLogoutTimer.hour4:
        return Strings.loginAutoLogoutHour4;
    }
  }
}

class _EmailTextColumn extends StatelessWidget {
  const _EmailTextColumn(this.controller);

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          Strings.loginUsername,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        TextFormField(
          controller: controller,
          // autovalidateMode:
          //     AutovalidateMode.onUnfocus,
          validator: (val) {
            if (val == null || val.isEmpty) {
              return Strings.loginUsernameEmpty;
            }
            if (val.isValidEmail() == false) {
              return Strings.loginErrorEmailNotValidated;
            }
            return null;
          },
          style: Theme.of(context).textTheme.bodyMedium,
          textInputAction: TextInputAction.next,
          keyboardType: TextInputType.emailAddress,
          onFieldSubmitted: (term) {
            FocusScope.of(context).nextFocus();
          },
          maxLines: 1,
          // autofillHints: const [AutofillHints.email],
        ),
        const SizedBox(height: 24.0),
      ],
    );
  }
}

class _PasswordColumn extends StatelessWidget {
  const _PasswordColumn({
    required this.controller,
    required this.state,
    required this.visibilityChanged,
    required this.onSubmit,
  });

  final TextEditingController controller;
  final LoginState state;
  final Function() visibilityChanged;
  final Function() onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          Strings.loginPassword,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        Stack(
          children: <Widget>[
            TextFormField(
              controller: controller,
              obscureText: !state.isPasswordVisible,

              validator: (val) {
                if (val == null || val.isEmpty) {
                  return Strings.loginPasswordEmpty;
                }
                if (val.isLongEnough(6) == false) {
                  return Strings.loginPasswordEmpty;
                }
                return null;
              },
              style: Theme.of(context).textTheme.bodyMedium,
              maxLines: 1,
              decoration: const InputDecoration(
                contentPadding: EdgeInsets.only(
                  left: 0.0,
                  right: 48.0,
                  top: 12.0,
                  bottom: 12.0,
                ),
              ),
              onFieldSubmitted: (term) {
                FocusScope.of(context).unfocus();
                onSubmit();
              },
              // autofillHints: const [AutofillHints.password],
              onEditingComplete: () => TextInput.finishAutofillContext(),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: IconButton(
                icon: Icon(
                  state.isPasswordVisible
                      ? Icons.visibility_off
                      : Icons.visibility,
                ),
                tooltip: state.isPasswordVisible
                    ? Strings.actionHidePassword
                    : Strings.actionViewPassword,
                color: Theme.of(context).colorScheme.secondary,
                onPressed: visibilityChanged,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8.0),
      ],
    );
  }
}

class _AutoLogoutColumn extends StatelessWidget {
  const _AutoLogoutColumn({
    required this.state,
    required this.autoLogoutValue,
    required this.changeAutoLogoutValue,
  });

  final LoginState state;
  final String Function(AutoLogoutTimer) autoLogoutValue;
  final Function(AutoLogoutTimer?) changeAutoLogoutValue;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          Strings.loginAutoLogout,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        DropdownButton<AutoLogoutTimer>(
          value: state.autoLogout,
          isExpanded: true,
          underline: const DropdownUnderline(),
          items: state.autoLogoutValues
              .map(
                (AutoLogoutTimer v) => DropdownMenuItem<AutoLogoutTimer>(
                  value: v,
                  child: Text(autoLogoutValue(v)),
                ),
              )
              .toList(),
          onChanged: changeAutoLogoutValue,
        ),
      ],
    );
  }
}

class _BiometricAuthentication extends StatelessWidget {
  const _BiometricAuthentication({
    required this.state,
    required this.onBiometricCheckChanged,
  });

  final LoginState state;
  final Function(bool?) onBiometricCheckChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const SizedBox(height: 16.0),
        Text(
          Strings.loginBiometrics,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 8.0),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            Checkbox(
              value: state.biometricsChecked,
              onChanged: onBiometricCheckChanged,
            ),
            Expanded(
              child: Text(
                Strings.loginBiometricsCheckbox,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: null,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _AuthButtons extends StatelessWidget {
  const _AuthButtons({
    required this.onSubmit,
    required this.formKey,
    required this.remoteConfig,
    required this.state,
  });

  final GlobalKey<FormState> formKey;
  final Function onSubmit;
  final RemoteConfiguration remoteConfig;
  final LoginState state;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 24.0),
        SizedBox(
          width: double.infinity,
          child: RoundedInverseButton(
            context,
            title: Strings.actionLogin,
            onPressed: () {
              if (formKey.currentState?.validate() == true) {
                FocusScope.of(context).unfocus();
                onSubmit();
              }
            },
          ),
        ),
        const SizedBox(height: 32.0),
        if (!remoteConfig.disableUserCreate)
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                SizedBox(
                  width: double.maxFinite,
                  // padding:
                  // const EdgeInsets.only(left: 24.0, right: 24.0, bottom: 16),
                  child: RoundedInverseButton(
                    context,
                    title: Strings.actionSignUp.toUpperCase(),
                    onPressed: () {
                      BlocProvider.of<AuthenticationBloc>(
                        context,
                      ).add(SignUpRequestedEvent());
                    },
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _LoadingWidget extends StatelessWidget {
  const _LoadingWidget({required this.state});

  final LoginState state;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      ignoring: !state.isLoading,
      child: Stack(
        children: [
          Container(color: Colors.black.withValues(alpha: 0.5)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (state.isType2fa)
                  Container(
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.all(Radius.circular(8.0)),
                    ),
                    child: Column(
                      children: [
                        Container(
                          decoration: const BoxDecoration(
                            color: Colors.blue,
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(8.0),
                              topRight: Radius.circular(8.0),
                            ),
                          ),
                          width: double.infinity,
                          height: 48,
                          child: const Center(
                            child: Text(
                              '2FA for secure logon',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 24.0,
                              ),
                            ),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.all(24.0),
                          child: Text(
                            'Your account is protected by AuthArmor. Login to your AuthArmor app and approve',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.black),
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 16.0),
                const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation(Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
