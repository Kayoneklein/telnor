part of '../index.dart';

class SettingScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final themeData = Theme.of(context);
    final primaryColor = themeData.primaryColor;
    final textStyle = themeData.textTheme.bodyMedium?.apply(
      color: primaryColor,
    );

    Widget _tile({
      required String text,
      required IconData icon,
      required VoidCallback onTap,
    }) {
      return ListTile(
        title: Text(text, style: textStyle),
        leading: Icon(icon, color: themeData.primaryColor),
        onTap: onTap,
      );
    }

    final tiles = <Widget>[
      _tile(
        text: Strings.settingsChooseLanguage,
        icon: FontAwesomeIcons.language,
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute<void>(
              builder: (context) => ChooseLanguageScreen(),
            ),
          );
        },
      ),
      const Divider(),
      _tile(
        text: Strings.settingsAutoFillSetting,
        icon: FontAwesomeIcons.lock,
        onTap: () async {
          if (Platform.isAndroid) {
            await AutofillService().requestSetAutofillService();
          } else {
            //Navigator.of(context).pop();
            showCupertinoModalPopup<void>(
              context: context,
              builder: (BuildContext context) => CupertinoAlertDialog(
                title: Text(Strings.messageMakeAppPasswordManagerIOS1),
                content: Text(Strings.messageMakeAppPasswordManagerIOS2),
                actions: <CupertinoDialogAction>[
                  CupertinoDialogAction(
                    /// This parameter indicates this action is the default,
                    /// and turns the action's text to bold text.
                    isDefaultAction: true,
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: Text(Strings.actionOk),
                  ),
                ],
              ),
            );
          }

          // await Navigator.push(context, MaterialPageRoute<void>(builder: (context) => TagsScreen()));
          // passwordsBloc.add(RetryPressed());
        },
      ),
    ];
    return BlocListener<settings.SettingsBloc, settings.SettingsState>(
      listener: _stateChangeListener,
      child: Scaffold(
        appBar: AppBar(
          title: Text(Strings.drawerMenuItemSettings),
          centerTitle: false,
          leading: PopScope(
            canPop: false,
            onPopInvokedWithResult: (bool? pop, result) {
              _backButtonPressed(context);
            },
            child: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                _backButtonPressed(context);
              },
            ),
          ),
          //!!!            actions: state.isInitialized
          //                ? [
          //                    IconButton(
          //                      icon: Icon(Icons.check),
          //                      tooltip: Strings.actionConfirm,
          //                      onPressed: _confirmButtonPressed,
          //                    ),
          //                  ]
          //                : [],
        ),
        body: ListView(children: tiles),
      ),
    );
  }

  Future<void> _stateChangeListener(
    BuildContext context,
    settings.SettingsState state,
  ) async {
    if (state is settings.NavigateBackState) {
      Navigator.of(context).pop();
    }
  }

  void _backButtonPressed(BuildContext context) {
    BlocProvider.of<settings.SettingsBloc>(
      context,
    ).add(settings.BackButtonPressed());
  }
}
