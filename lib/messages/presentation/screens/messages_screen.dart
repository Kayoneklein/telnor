part of '../../index.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<MessagesBloc, MessagesState>(
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
        if (state is MessageSentState) {
          final message = state.message;
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              state.isSuccess
                  ? SnackBar(content: Text(Strings.messagesSendSuccess))
                  : SnackBar(
                      content: Text(Strings.messagesSendFailure),
                      action: SnackBarAction(
                        label: Strings.actionRetry.toUpperCase(),
                        onPressed: () {
                          BlocProvider.of<MessagesBloc>(
                            context,
                          ).add(MessageSendPressed(message: message!));
                        },
                      ),
                    ),
            );
        }
        if (state is MessagesDeletedState) {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              SnackBar(
                content: Text(
                  state.isSuccess
                      ? Strings.messagesDeleteSuccess
                      : Strings.messagesDeleteFailure,
                ),
              ),
            );
        }
      },
      child: BlocBuilder<MessagesBloc, MessagesState>(
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

  ///Method for generating widget for list of messages
  Widget _buildList(BuildContext context, MessagesState state) {
    if (state.isLoadingError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Text(
              Strings.messagesErrorLoad,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              child: Text(Strings.actionRetry.toUpperCase()),
              onPressed: () {
                BlocProvider.of<MessagesBloc>(context).add(RetryPressed());
              },
            ),
          ],
        ),
      );
    }
    if (!state.isMessagesAvailable) {
      return const SizedBox(width: 0.0);
    }
    if (state.displayedMessages.isEmpty) {
      return state.isSearchVisible
          ? NoDataAvailable(
              icon: Icons.search,
              title: Strings.messagesEmptyTitle,
              message: Strings.messagesNotFoundMessage,
            )
          : NoDataAvailable(
              icon: Icons.message,
              title: Strings.messagesEmptyTitle,
              message: Strings.messagesEmptyMessage,
            );
    }
    return RefreshIndicator(
      color: Theme.of(context).primaryIconTheme.color,
      backgroundColor: Theme.of(context).primaryColor,
      onRefresh: () {
        BlocProvider.of<MessagesBloc>(context).add(RetryPressed());
        return Future<void>.delayed(const Duration(seconds: 1));
      },
      child: MessagesList(
        messages: state.displayedMessages.toList(),
        onItemClicked: (position, message) {
          if (state.selectionModeActive) {
            BlocProvider.of<MessagesBloc>(
              context,
            ).add(MessagePressed(message: message));
          } else {
            _viewMessageDetails(context, message, state.currentBox);
          }
        },
        onItemLongClicked: (position, message) {
          BlocProvider.of<MessagesBloc>(
            context,
          ).add(MessageLongPressed(message: message));
        },
        isSelectionMode: state.selectionModeActive,
        selectedIds: state.selectedMessageIds.toSet(),
      ),
    );
  }

  /// Method to initiate viewing message details
  Future<void> _viewMessageDetails(
    BuildContext context,
    Message message,
    MessagesBox box,
  ) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute<MessageResult>(
        builder: (context) => MessageDetailsScreen(message, box),
      ),
    );
    if (result is MessageSendResult) {
      BlocProvider.of<MessagesBloc>(
        context,
      ).add(MessageSendPressed(message: result.message));
    }
    if (result is MessageDeleteResult) {
      BlocProvider.of<MessagesBloc>(
        context,
      ).add(DeletePressed(message: message));
    }
  }
}
