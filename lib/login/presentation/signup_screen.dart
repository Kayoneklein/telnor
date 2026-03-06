part of '../index.dart';

///Screen for logging into the app
class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(Strings.signUpTitle),
        leading: PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool? pop, result) {
            BlocProvider.of<AuthenticationBloc>(
              context,
            ).add(LoginRequestedEvent());
          },
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => BlocProvider.of<AuthenticationBloc>(
              context,
            ).add(LoginRequestedEvent()),
          ),
        ),
      ),
      body: BlocProvider(
        create: (context) => SignUpBloc(),
        child: SignUpForm(),
      ),
      resizeToAvoidBottomInset: false,
    );
  }
}

/// Widget that shows sign up form and performs interaction with Bloc
class SignUpForm extends StatefulWidget {
  const SignUpForm({super.key});

  @override
  State createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  late final SignUpBloc _bloc;
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<SignUpBloc>(context);
    _usernameController.addListener(_onUsernameChanged);
    _passwordController.addListener(_onPasswordChanged);
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<SignUpBloc, SignUpState>(
      listener: (context, state) {
        // Success
        if (state.signUpStatus == SignUpStatus.success) {
          BlocProvider.of<AuthenticationBloc>(
            context,
          ).add(const SignedInEvent());
        }
        // Errors
        if (state.signUpStatus == SignUpStatus.invalidEmail) {
          _showErrorDialog(Strings.signUpErrorInvalidEmail);
        } else if (state.signUpStatus == SignUpStatus.accountExists) {
          _showErrorDialog(Strings.signUpErrorAccountExists);
        } else if (state.signUpStatus == SignUpStatus.otherError) {
          _showErrorDialog(state.errorMessage);
        }
      },
      child: BlocBuilder<SignUpBloc, SignUpState>(
        builder: (context, state) {
          return Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        Strings.signUpEmail,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      TextFormField(
                        controller: _usernameController,
                        autofocus: true,
                        autovalidateMode: AutovalidateMode.always,
                        validator: (_) => state.isEmailValid
                            ? null
                            : Strings.signUpEmailEmpty,
                        style: Theme.of(context).textTheme.bodyMedium,
                        textInputAction: TextInputAction.next,
                        keyboardType: TextInputType.emailAddress,
                        onFieldSubmitted: (term) {
                          FocusScope.of(context).nextFocus();
                        },
                        maxLines: 1,
                      ),
                      const SizedBox(height: 24.0),
                      Text(
                        Strings.signUpPassword,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      Stack(
                        children: <Widget>[
                          TextFormField(
                            controller: _passwordController,
                            obscureText: !state.isPasswordVisible,
                            autovalidateMode: AutovalidateMode.always,
                            validator: (_) => state.isPasswordValid
                                ? null
                                : Strings.signUpPasswordEmpty,
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
                          ),
                          Align(
                            alignment: Alignment.centerRight,
                            child: IconButton(
                              icon: Icon(
                                state.isPasswordVisible
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                              ),
                              color: Theme.of(context).colorScheme.secondary,
                              onPressed: _onPasswordVisibilityChanged,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24.0),
                      SizedBox(
                        width: double.infinity,
                        child: RoundedInverseButton(
                          context,
                          title: Strings.actionSignUp,
                          onPressed: () {
                            FocusScope.of(context).unfocus();
                            _onSubmitPressed();
                          },
                        ),
                      ),
                      const SizedBox(height: 32.0),
                      const Expanded(child: SizedBox(height: double.maxFinite)),
                    ],
                  ),
                ),
              ),
              IgnorePointer(
                ignoring: !state.isLoading,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 500),
                  opacity: state.isLoading ? 0.8 : 0.0,
                  child: Container(
                    color: Colors.grey,
                    alignment: Alignment.center,
                    child: const CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation(Colors.black),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  ///Helper method for showing error dialogs
  void _showErrorDialog(String message) {
    showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(Strings.signUpError),
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
    ).then((_) => _bloc.add(signup.ErrorMessageViewed()));
  }

  void _onUsernameChanged() {
    _bloc.add(signup.EmailChanged(email: _usernameController.text));
  }

  void _onPasswordChanged() {
    _bloc.add(signup.PasswordChanged(password: _passwordController.text));
  }

  void _onPasswordVisibilityChanged() {
    _bloc.add(signup.PasswordVisibilityChanged());
  }

  void _onSubmitPressed() {
    _bloc.add(signup.FormSubmitted());
  }
}
