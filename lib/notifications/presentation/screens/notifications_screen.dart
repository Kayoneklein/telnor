part of '../../index.dart';

/// Screen to display notifications and global messages
class NotificationsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocListener<NotificationsBloc, NotificationsState>(
      listener: (context, state) {
        if (state is SessionExpiredState) {
          BlocProvider.of<AuthenticationBloc>(
            context,
          ).add(SessionExpiredEvent());
        }
        if (state is ConnectionErrorState) {
          // show error dialog
          connectionError(context, state.errorMessage);
        }
      },
      child: BlocBuilder<NotificationsBloc, NotificationsState>(
        builder: (context, state) {
          return Scaffold(
            body: Stack(
              children: [
                _buildList(context, state),
                if (state.isLoading) const LinearProgressIndicator(),
              ],
            ),
          );
        },
      ),
    );
  }

  ///Method for generating widget for list of passwords
  Widget _buildList(BuildContext context, NotificationsState state) {
    if (state.isLoadingError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Text(
              Strings.notificationsErrorLoad,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              child: Text(Strings.actionRetry.toUpperCase()),
              onPressed: () {
                BlocProvider.of<NotificationsBloc>(context).add(RetryPressed());
              },
            ),
          ],
        ),
      );
    }
    if (!state.isNotificationsAvailable) {
      return const SizedBox(width: 0.0);
    }
    if (state.globalMessages.isEmpty) {
      //TODO change
      return /*state.isSearchVisible ? NoDataAvailable(
        icon: Icons.search,
        title: Strings.notificationsEmptyTitle,
        message: Strings.notificationsNotFoundMessage,
      ) :*/ NoDataAvailable(
        icon: Icons.notifications_none,
        title: Strings.notificationsEmptyTitle,
        message: Strings.notificationsEmptyMessage,
      );
    }
    return RefreshIndicator(
      color: Theme.of(context).primaryIconTheme.color,
      backgroundColor: Theme.of(context).primaryColor,
      onRefresh: () {
        BlocProvider.of<NotificationsBloc>(context).add(RetryPressed());
        return Future<void>.delayed(const Duration(seconds: 1));
      },
      child: NotificationsList(
        notifications: state.globalMessages.toList(),
        onItemClicked: (position, message) {
          /*if (state.selectionModeActive) {
            BlocProvider.of<NotificationsBloc>(context).add(MessagePressed(message: message));
          } else {*/
          _viewNotificationDetails(context, message);
          /*}*/
        },
        onItemLongClicked: (position, message) {
          /*BlocProvider.of<NotificationsBloc>(context).add(MessageLongPressed(message: message));*/
        },
        isSelectionMode: false /*state.selectionModeActive*/,
        selectedIds: const {} /*state.selectedMessageIds.toSet()*/,
      ),
    );
  }

  /// Method to initiate viewing notification details
  Future<void> _viewNotificationDetails(
    BuildContext context,
    GlobalMessage message,
  ) async {
    await Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (context) => NotificationDetailsScreen(message),
      ),
    );
  }
}
