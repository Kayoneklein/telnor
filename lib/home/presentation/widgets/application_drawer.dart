part of '../../index.dart';

class ApplicationDrawer extends StatelessWidget {
  const ApplicationDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authBloc = BlocProvider.of<AuthenticationBloc>(context);
    final passwordsBloc = BlocProvider.of<PasswordsBloc>(context);
    final authState = authBloc.state;

    final themeData = Theme.of(context);
    final primaryColor = themeData.primaryColor;
    final textStyle = themeData.textTheme.bodyMedium
        ?.apply(color: primaryColor)
        .copyWith(fontWeight: FontWeight.w500);

    Widget tile({
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
      if (authState is Authenticated)
        UserAccountDrawerHeader(user: authState.user),
      tile(
        text: Strings.drawerMenuItemUserInfo,
        icon: FontAwesomeIcons.circleUser,
        onTap: () {
          Navigator.of(context).pop();
          Navigator.push(
            context,
            MaterialPageRoute<void>(builder: (context) => UserInfoScreen()),
          );
        },
      ),

      const Divider(),
      tile(
        text: Strings.drawerMenuItemSettings,
        icon: FontAwesomeIcons.gear,
        onTap: () async {
          Navigator.of(context).pop();
          Navigator.push(
            context,
            MaterialPageRoute<void>(
              builder: (context) => BlocProvider(
                create: (context) => SettingsBloc()..loadInitialState(),
                child: SettingScreen(),
              ),
            ),
          );
        },
      ),

      const Divider(),
      tile(
        text: Strings.drawerMenuItemTagsManager,
        icon: FontAwesomeIcons.tags,
        onTap: () async {
          Navigator.of(context).pop();
          await Navigator.push(
            context,
            MaterialPageRoute<void>(builder: (context) => TagsScreen()),
          );
          passwordsBloc.add(RetryPressed());
        },
      ),
      //      _tile(text: Strings.drawerMenuItemSecurity, icon: FontAwesomeIcons.shieldAlt),
      const Divider(),
      tile(
        text: Strings.drawerMenuItemUserManual,
        icon: FontAwesomeIcons.bookOpen,
        onTap: () {
          Navigator.of(context).pop();
          final Language language = Localization.get.currentLanguage;
          launchUrl(Uri.parse(getManualUrl(context, language.code)));
        },
      ),
    ];
    return Drawer(child: ListView(children: tiles));
  }

  String getManualUrl(BuildContext context, String languageCode) =>
      BlocProvider.of<ConfigurationBloc>(context)
          .state
          .configuration
          .manualAppUrl
          ?.manuals
          .firstWhere((element) => element.name == languageCode)
          .link ??
      '';
}
