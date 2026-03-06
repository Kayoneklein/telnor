part of '../../index.dart';

class HomeTabSelector extends StatelessWidget {
  const HomeTabSelector({
    super.key,
    required this.tabs,
    required this.activeTab,
    required this.onTabSelected,
  });

  final List<AppTab> tabs;
  final AppTab activeTab;
  final Function(AppTab) onTabSelected;

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      key: const Key('__bottom_navigation___'),
      currentIndex: tabs.contains(activeTab) ? tabs.indexOf(activeTab) : 0,
      onTap: (index) => onTabSelected(tabs[index]),
      items: tabs.map<BottomNavigationBarItem>((tab) {
        switch (tab) {
          case AppTab.passwords:
            return BottomNavigationBarItem(
              icon: BlocBuilder<AuthenticationBloc, AuthenticationState>(
                builder: (context, state) {
                  return Stack(
                    children: <Widget>[
                      const Padding(
                        padding: EdgeInsets.only(left: 4.0, right: 4.0),
                        child: Icon(Icons.lock_outline),
                      ),
                      BadgeIndicator(value: state.newSharesCount),
                    ],
                  );
                },
              ),
              label: Strings.tabPasswords,
            );
          case AppTab.messages:
            return BottomNavigationBarItem(
              icon: BlocBuilder<AuthenticationBloc, AuthenticationState>(
                builder: (context, state) {
                  return Stack(
                    children: <Widget>[
                      const Padding(
                        padding: EdgeInsets.only(left: 4.0, right: 4.0),
                        child: Icon(Icons.message),
                      ),
                      BadgeIndicator(value: state.newMessagesCount),
                    ],
                  );
                },
              ),
              label: Strings.tabMessages,
            );
          case AppTab.notifications:
            return BottomNavigationBarItem(
              icon: BlocBuilder<NotificationsBloc, NotificationsState>(
                builder: (context, state) {
                  return Stack(
                    children: <Widget>[
                      const Padding(
                        padding: EdgeInsets.only(left: 4.0, right: 4.0),
                        child: Icon(Icons.notifications_none),
                      ),
                      BadgeIndicator(value: state.globalMessageCount),
                    ],
                  );
                },
              ),
              label: Strings.tabNotifications,
            );
        }
      }).toList(),
    );
  }
}
