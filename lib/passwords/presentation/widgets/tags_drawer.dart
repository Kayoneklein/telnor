import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/passwords/bloc/password_edit_bloc.dart';
import 'package:telnor/passwords/bloc/password_edit_event.dart';
import 'package:telnor/passwords/bloc/password_edit_state.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

class TagsEndDrawer extends StatelessWidget {
  TagsEndDrawer({required this.state, required this.scaffoldKey, super.key});
  final PasswordEditState state;

  final GlobalKey<ScaffoldState> scaffoldKey;
  // final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    Widget content;
    switch (state.groupsLoadingStatus) {
      case LoadingStatus.loading:
        content = const Center(child: CircularProgressIndicator());
        break;
      case LoadingStatus.error:
        content = Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.max,
            children: <Widget>[
              Text(
                Strings.passwordGroupsLoadingError,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8.0),
              ElevatedButton(
                child: Text(Strings.actionRetry.toUpperCase()),
                onPressed: () {
                  BlocProvider.of<PasswordEditBloc>(
                    context,
                  ).add(LoadGroupsEvent());
                },
              ),
            ],
          ),
        );
        break;
      case LoadingStatus.loaded:
        content = ScrollConfiguration(
          behavior: NoEdgeEffectScrollBehavior(),
          child: Scrollbar(
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: state.allGroups.length,
              itemBuilder: (context, position) {
                final group = state.allGroups[position];
                return InkWell(
                  onTap: () {
                    BlocProvider.of<PasswordEditBloc>(
                      context,
                    ).add(TagSelectionChanged(tagId: group.id));
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(left: 16.0, right: 16.0),
                    child: Row(
                      children: <Widget>[
                        IgnorePointer(
                          child: Checkbox(
                            value: state.selectedGroupIds.contains(group.id),
                            onChanged: (_) {},
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Expanded(
                          child: Text(
                            group.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        );
        break;
    }
    return SafeArea(
      child: ClipRRect(
        borderRadius: const BorderRadius.only(topLeft: Radius.circular(8.0)),
        child: Drawer(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.only(
                  left: 28.0,
                  right: 0.0,
                  top: 24.0,
                  bottom: 8.0,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        Strings.passwordSetTags,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ),
                    IgnorePointer(
                      ignoring:
                          state.groupsLoadingStatus != LoadingStatus.loaded,
                      child: Opacity(
                        opacity:
                            state.groupsLoadingStatus == LoadingStatus.loaded
                            ? 1.0
                            : 0.0,
                        child: TextButton(
                          style: ButtonStyle(
                            foregroundColor: WidgetStateProperty.all(
                              Theme.of(context).colorScheme.secondary,
                            ),
                          ),
                          child: Text(Strings.actionOk.toUpperCase()),
                          onPressed: () {
                            FocusScope.of(context).unfocus();
                            scaffoldKey.currentState?.closeEndDrawer();
                            BlocProvider.of<PasswordEditBloc>(
                              context,
                            ).add(TagsSelectionConfirmed());
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(child: content),
              (state.groupsLoadingStatus == LoadingStatus.loaded)
                  ? Align(
                      alignment: Alignment.centerRight,
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: TextButton(
                          style: ButtonStyle(
                            foregroundColor: WidgetStateProperty.all(
                              Theme.of(context).colorScheme.secondary,
                            ),
                          ),
                          child: Text(
                            Strings.passwordTagsCreateNew.toUpperCase(),
                          ),
                          onPressed: () async {
                            final readOnly = await Preferences().readonlyMode;
                            if (readOnly == true) {
                              Fluttertoast.showToast(
                                msg: Strings.readOnlyToastAlert,
                              );
                            } else {
                              BlocProvider.of<PasswordEditBloc>(
                                context,
                              ).add(CreateTagPressed());
                            }
                          },
                        ),
                      ),
                    )
                  : const SizedBox(height: 0.0),
            ],
          ),
        ),
      ),
    );
  }
}
