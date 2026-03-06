part of '../../index.dart';

class UserAccountDrawerHeader extends StatefulWidget {
  const UserAccountDrawerHeader({super.key, required User user}) : _user = user;

  final User _user;

  @override
  State<UserAccountDrawerHeader> createState() =>
      _UserAccountDrawerHeaderState();
}

class _UserAccountDrawerHeaderState extends State<UserAccountDrawerHeader> {
  String? currentServer;

  @override
  void initState() {
    super.initState();
    _initPreferences();
  }

  Future<void> _initPreferences() async {
    currentServer = await Preferences().currentServer;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _buildTopHeader(context),
        const Divider(height: 1.0),
        Padding(
          padding: const EdgeInsets.only(
            left: 10.0,
            top: 8.0,
            bottom: 8.0,
            right: 8.0,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.grey[300],
                    backgroundImage: widget._user.avatar.isNotEmpty
                        ? MemoryImage(widget._user.avatar) as ImageProvider
                        : const AssetImage(PImages.userDefault),
                  ),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0),
                        child: Text(
                          widget._user.email,
                          style: theme.textTheme.bodySmall,
                        ),
                      ),
                      if (currentServer?.isNotEmpty == true)
                        SizedBox(
                          width: size.width * 0.3,
                          child: TextButton(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.only(left: 0),
                            ),
                            onPressed: () {
                              if (currentServer!.length > 22) {
                                showDialog(
                                  context: context,
                                  builder: (ctx) {
                                    return Dialog(
                                      alignment: Alignment.topLeft,
                                      insetPadding: EdgeInsets.only(
                                        top: size.height * 0.1,
                                        left: 20,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(5.0),
                                        child: Text(currentServer ?? ''),
                                      ),
                                    );
                                  },
                                );
                              }
                            },
                            child: Align(
                              alignment: Alignment.topLeft,
                              child: Text(
                                currentServer ?? '',
                                style: theme.textTheme.bodySmall,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),

              IconButton(
                icon: const Icon(FontAwesomeIcons.powerOff),
                color: Colors.grey,
                tooltip: Strings.actionLogout,
                onPressed: () async {
                  Navigator.of(context).pop();
                  BlocProvider.of<AuthenticationBloc>(
                    context,
                  ).add(SignedOutEvent());
                },
              ),
            ],
          ),
        ),
        const Divider(height: 1.0),
      ],
    );
  }

  Padding _buildTopHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          widget._user.isPremium || widget._user.isPremiumTrial
              ? Container(
                  padding: const EdgeInsets.only(
                    top: 4.0,
                    bottom: 4.0,
                    left: 8.0,
                    right: 8.0,
                  ),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: Theme.of(context).colorScheme.secondary,
                      width: 1.0,
                    ),
                    borderRadius: const BorderRadius.all(Radius.circular(8.0)),
                  ),
                  child: Text(
                    widget._user.isPremiumTrial
                        ? Strings.drawerAccountTrial
                        : Strings.drawerAccountPremium,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: <Widget>[
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: const BorderRadius.all(
                          Radius.circular(4.0),
                        ),
                      ),
                      padding: const EdgeInsets.only(
                        top: 4.0,
                        bottom: 4.0,
                        left: 8.0,
                        right: 8.0,
                      ),
                      child: Text(
                        Strings.drawerAccountFree,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                    const Expanded(child: SizedBox(width: 4)),
                  ],
                ),
        ],
      ),
    );
  }
}
