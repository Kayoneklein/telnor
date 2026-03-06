part of '../index.dart';

class DeleteAccount extends StatefulWidget {
  const DeleteAccount({super.key});

  @override
  State<DeleteAccount> createState() => _DeleteAccountState();
}

class _DeleteAccountState extends State<DeleteAccount> {
  final passController = TextEditingController();
  final _key = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(Strings.deleteAccountRemoveAccount)),
      body: BlocConsumer<DeleteAccountBloc, DeleteAccountState>(
        listener: (_, state) {
          if (state is DeleteAccountSucceedState) {
            _accountDeleteSuccess(context);
          }

          if (state is DeleteAccountErrorState) {
            displaySnackBar(message: state.error, context: context);
          }

          if (state is DeleteAccountEmailSentState) {
            Navigator.pushNamedAndRemoveUntil(
              context,
              '/',
              (Route<dynamic> route) => false,
            );
            BlocProvider.of<AuthenticationBloc>(context).add(SignedOutEvent());
          }
        },
        builder: (_, state) {
          return Form(
            key: _key,
            child: Padding(
              padding: const EdgeInsets.only(left: 18.0, right: 18, top: 80),
              child: Column(
                children: [
                  Text(
                    Strings.deleteAccount,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 50.0),
                    child: Text(
                      Strings.deleteAccountText1,
                      style: theme.textTheme.bodyMedium?.copyWith(fontSize: 18),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 30.0, top: 100),
                    child: RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        text: Strings.deleteAccountText2,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontSize: 18,
                        ),
                        children: [
                          TextSpan(
                            text: ' ${Strings.deleteAccountText3}',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(text: ' ${Strings.deleteAccountText4}:'),
                        ],
                      ),
                    ),
                  ),
                  TextFormField(
                    controller: passController,
                    validator: (val) {
                      if ((val?.length ?? 0) < 6) {
                        return Strings.deleteAccountConfirmPasswordText;
                      }
                      return null;
                    },
                    obscureText: true,
                    style: theme.textTheme.bodyMedium,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      contentPadding: EdgeInsets.all(12),
                      border: OutlineInputBorder(),
                    ),
                    onFieldSubmitted: (term) {
                      FocusScope.of(context).unfocus();
                    },
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 50.0),
                    child: SizedBox(
                      width: double.infinity,
                      child: RoundedInverseButton(
                        context,
                        title: Strings.deleteAccountRemoveAccount,
                        uppcaseTransform: false,
                        borderRadius: 10,
                        onPressed: () {
                          if (_key.currentState?.validate() == true) {
                            FocusScope.of(context).unfocus();
                            BlocProvider.of<DeleteAccountBloc>(context).add(
                              RequestDeleteAccount(
                                password: passController.text,
                              ),
                            );
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

void _accountDeleteSuccess(BuildContext context) {
  showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext _) {
      final size = MediaQuery.of(context).size;
      final theme = Theme.of(context);
      return AlertDialog(
        title: Text(Strings.deleteAccountTerminateAccount),
        content: Text(Strings.deleteAccountEmailSentText),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          TextButton(
            style: OutlinedButton.styleFrom(
              backgroundColor: Colors.blue,
              fixedSize: Size(size.width * 0.4, 45),
            ),
            child: Text(
              Strings.actionOk.toUpperCase(),
              style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white),
            ),
            onPressed: () {
              BlocProvider.of<DeleteAccountBloc>(
                context,
              ).add(DeleteAccountEmailLinkSent());
              Navigator.of(context).pop();
            },
          ),
        ],
      );
    },
  );
}
