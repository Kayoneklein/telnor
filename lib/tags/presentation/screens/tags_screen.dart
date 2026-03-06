part of '../../index.dart';

class TagsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider<TagsBloc>(
      create: (_) => TagsBloc(
        isPremium: BlocProvider.of<AuthenticationBloc>(
          context,
        ).isPremiumFeaturesAvailable,
      ),
      child: BlocListener<TagsBloc, TagsState>(
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
          if (state is PremiumRequiredState) {
            showPremiumRestrictionsDialog(context);
          }
          if (state is TagCreationPermittedState) {
            _addNewTag(context);
          }
          if (state is TagsSavedState) {
            _tagsUpdateResult(context, state.isSavedSuccessfully);
          }
        },
        child: BlocBuilder<TagsBloc, TagsState>(
          builder: (context, state) {
            return Scaffold(
              appBar: AppBar(
                title: Text(Strings.tagsTitle),
                centerTitle: false,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ),
              body: Stack(
                children: [
                  _buildList(context, state),
                  state.isLoading
                      ? const LinearProgressIndicator()
                      : const SizedBox(height: 0.0),
                ],
              ),
              floatingActionButton: state.isTagsAvailable
                  ? FloatingActionButton(
                      child: const Icon(Icons.add),
                      tooltip: Strings.tagsAdd,
                      onPressed: () => _onAddTagPressed(context),
                    )
                  : const SizedBox(width: 0.0, height: 0.0),
            );
          },
        ),
      ),
    );
  }

  ///Method for generating widget for list of passwords
  Widget _buildList(BuildContext context, TagsState state) {
    if (state.isLoadingError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Text(
              Strings.tagsErrorLoad,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              child: Text(Strings.actionRetry.toUpperCase()),
              onPressed: () {
                BlocProvider.of<TagsBloc>(context).add(RetryPressed());
              },
            ),
          ],
        ),
      );
    }
    if (!state.isTagsAvailable) {
      return const SizedBox(width: 0.0);
    }
    if (state.tags.isEmpty) {
      return NoDataAvailable(
        icon: Icons.local_offer,
        title: Strings.tagsEmptyTitle,
        message: Strings.tagsEmptyMessage,
      );
    }
    return RefreshIndicator(
      color: Theme.of(context).primaryIconTheme.color,
      backgroundColor: Theme.of(context).primaryColor,
      onRefresh: () {
        BlocProvider.of<TagsBloc>(context).add(RetryPressed());
        return Future<void>.delayed(const Duration(seconds: 1));
      },
      child: TagsList(
        groups: state.tags.toList(),
        onItemClicked: (position, tag) => _editTag(context, tag),
        onItemDeleted: (position, tag) => _deleteTag(context, tag),
      ),
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// User pressed Create Tag button
  void _onAddTagPressed(BuildContext context) {
    BlocProvider.of<TagsBloc>(context).add(AddTagPressed());
  }

  /// Method for adding new tag
  Future<void> _addNewTag(BuildContext context) async {
    final name = await showEditTextDialog(
      context,
      title: Strings.tagsAdd,
      hint: Strings.tagsName,
      emptyMessage: Strings.tagsNameEmpty,
      positiveTitle: Strings.actionCreate,
      cancelTitle: Strings.actionCancel,
    );
    if (name != null) {
      BlocProvider.of<TagsBloc>(context).add(TagAdded(name: name));
    }
  }

  /// Method for editing specific tag
  Future<void> _editTag(BuildContext context, Group tag) async {
    final name = await showEditTextDialog(
      context,
      title: Strings.tagsRename,
      initialText: tag.name,
      hint: Strings.tagsName,
      emptyMessage: Strings.tagsNameEmpty,
      positiveTitle: Strings.actionRename,
      cancelTitle: Strings.actionCancel,
    );
    if (name != null) {
      BlocProvider.of<TagsBloc>(
        context,
      ).add(TagRenamed(tag: tag, newName: name));
    }
  }

  //Method for deleting specific tag
  void _deleteTag(BuildContext context, Group tag) {
    showDialog<void>(
      context: context,
      builder: (c) {
        return AlertDialog(
          content: Text(Strings.tagsDeleteConfirmation),
          actions: <Widget>[
            TextButton(
              child: Text(Strings.actionNo.toUpperCase()),
              onPressed: () {
                Navigator.of(c).pop();
              },
            ),
            TextButton(
              child: Text(Strings.actionYes.toUpperCase()),
              onPressed: () {
                Navigator.of(c).pop();
                BlocProvider.of<TagsBloc>(context).add(TagDeleted(tag: tag));
              },
            ),
          ],
        );
      },
    );
  }

  /// Fires after making changes to tags list
  /// [isSuccess] is *true* if changes were successfully saved to the server, and *false* in case of errors
  void _tagsUpdateResult(BuildContext context, bool isSuccess) {
    if (isSuccess) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(Strings.tagsUpdateSuccess)));
    } else {
      showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(Strings.tagsUpdateFailTitle),
            content: Text(Strings.tagsUpdateFailMessage),
            actions: <Widget>[
              TextButton(
                child: Text(Strings.actionOk.toUpperCase()),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        },
      );
    }
  }
}
