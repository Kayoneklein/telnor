import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/config/configuration_bloc.dart';
import 'package:telnor/model/filter.dart';
import 'package:telnor/model/sorting_order.dart';
import 'package:telnor/passwords/bloc/password_edit_bloc.dart';
import 'package:telnor/passwords/bloc/password_edit_event.dart';
import 'package:telnor/passwords/bloc/password_edit_state.dart';
import 'package:telnor/passwords/bloc/passwords_bloc.dart';
import 'package:telnor/passwords/bloc/passwords_state.dart';
import 'package:telnor/passwords/presentation/widgets/popup_sub_menu_item.dart';
import 'package:telnor/util/custom_icons.dart';
import 'package:telnor/util/strings.dart';

import '../../bloc/passwords_event.dart';

///[AppBar] user on the passwords screen
class PasswordsAppBar extends StatefulWidget implements PreferredSizeWidget {
  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  State createState() => _PasswordsAppBarState();
}

///State for [PasswordsAppBar]
class _PasswordsAppBarState extends State<PasswordsAppBar> {
  late final PasswordsBloc _bloc;
  late final bool _isSharingAvailable;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<PasswordsBloc>(context);
    if (_bloc.state.myPasswords.isEmpty && _bloc.state.isLoading == false) {
      _bloc.add(const RetryPressed(showLoading: false));
    }

    _isSharingAvailable = BlocProvider.of<AuthenticationBloc>(
      context,
    ).isVerifiedFeaturesAvailable;
    _searchController.addListener(
      () => _bloc.add(SearchTextChanged(text: _searchController.text)),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PasswordsBloc, PasswordsState>(
      builder: (context, state) => _buildAppBar(context, _bloc.state),
    );
  }

  /// Top screen bar
  AppBar _buildAppBar(BuildContext context, PasswordsState state) {
    if (state.isSearchVisible) {
      if (_searchController.text != state.searchQuery) {
        _searchController.text = state.searchQuery;
      }
      return AppBar(
        title: PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool? pop, result) {
            _bloc.add(const SearchVisibilityChanged(visible: false));
          },
          child: TextFormField(
            controller: _searchController,
            autofocus: true,
            style: Theme.of(context).primaryTextTheme.headlineSmall,
            cursorColor:
                Theme.of(context).primaryTextTheme.bodyMedium?.color ??
                Colors.white,
            decoration: InputDecoration(
              hintText: Strings.actionSearch,
              hintStyle: Theme.of(context).primaryTextTheme.bodyMedium,
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color:
                      Theme.of(context).primaryTextTheme.bodyMedium?.color ??
                      Colors.black,
                ),
              ),
            ),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: Strings.actionClose,
          onPressed: () {
            _bloc.add(const SearchVisibilityChanged(visible: false));
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear),
            tooltip: Strings.actionClear,
            onPressed: () {
              _bloc.add(const SearchTextChanged(text: ''));
            },
          ),
        ],
      );
    } else if (state.selectionModeActive) {
      return AppBar(
        title: PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool? pop, result) {
            _bloc.add(SelectionModeFinished());
          },
          child: Text(
            '${Strings.passwordsSelected} ${state.selectedPasswordIds.length}',
          ),
        ),
        backgroundColor: Colors.grey,
        leading: IconButton(
          icon: const Icon(Icons.close),
          tooltip: Strings.actionClose,
          onPressed: () {
            _bloc.add(SelectionModeFinished());
          },
        ),
        actions: [
          (state.selectedPasswordIds.length < state.myPasswords.length)
              ? IconButton(
                  icon: const Icon(FontAwesomeIcons.squareCheck),
                  tooltip: Strings.actionSelectAll,
                  onPressed: () {
                    _selectAllPasswords(context);
                  },
                )
              : IconButton(
                  icon: const Icon(FontAwesomeIcons.square),
                  tooltip: Strings.actionDeselectAll,
                  onPressed: () {
                    _deselectAllPasswords(context);
                  },
                ),
          if (_isSharingAvailable)
            IconButton(
              icon: const Icon(Icons.share),
              tooltip: Strings.actionShare,
              onPressed: () {
                if (state.selectedPasswordIds.isNotEmpty) {
                  _shareSelectedPasswords(context);
                }
              },
            ),
          IconButton(
            icon: const Icon(Icons.delete),
            tooltip: Strings.actionDelete,
            onPressed: () {
              if (state.selectedPasswordIds.isNotEmpty) {
                _deleteSelectedPasswords(context);
              }
            },
          ),
        ],
      );
    } else {
      return AppBar(
        title: !(state.currentFilter is AllFilter)
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(Strings.passwordsTitle),
                  Text(
                    state.currentFilter.name,
                    style: Theme.of(context).primaryTextTheme.headlineSmall,
                  ),
                ],
              )
            : Text(Strings.passwordsTitle),
        actions: [
          _buildSearchButton(context, state),
          _buildSortingButton(context, state),
          _buildFilterButton(context, state),
        ],
      );
    }
  }

  /// Action button to search passwords
  Widget _buildSearchButton(BuildContext context, PasswordsState state) {
    if (state.isPasswordsAvailable) {
      return IconButton(
        icon: const Icon(Icons.search),
        tooltip: Strings.actionSearch,
        onPressed: () {
          _bloc.add(const SearchVisibilityChanged(visible: true));
        },
      );
    } else {
      return const SizedBox(width: 0.0);
    }
  }

  /// Action button to sort list of passwords
  Widget _buildSortingButton(BuildContext context, PasswordsState state) {
    if (state.isPasswordsAvailable && state.allSortingOrders.isNotEmpty) {
      return PopupMenuButton<PasswordSortingOrder>(
        icon: const Icon(Icons.sort),
        tooltip: Strings.actionSort,
        onSelected: (value) {
          _bloc.add(SortingOrderChanged(order: value));
        },
        padding: EdgeInsets.zero,
        itemBuilder: (BuildContext context) {
          return state.allSortingOrders
              .map(
                (o) => PopupMenuItem<PasswordSortingOrder>(
                  value: o,
                  child: Row(
                    children: <Widget>[
                      IgnorePointer(
                        child: Radio(
                          value: o,
                          groupValue: state.currentSortingOrder,
                          onChanged: (PasswordSortingOrder? _) {},
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: Text(
                          _sortingOrderTitle(o),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              )
              .toList();
        },
      );
    } else {
      return const SizedBox(width: 0.0);
    }
  }

  /// Action button to filter list of passwords
  Widget _buildFilterButton(BuildContext context, PasswordsState state) {
    if (state.isPasswordsAvailable) {
      final remoteConfig = BlocProvider.of<ConfigurationBloc>(
        context,
      ).state.configuration;
      return PopupMenuButton<Filter>(
        icon: Icon(
          (state.currentFilter is AllFilter)
              ? CustomIcons.filter_outline
              : CustomIcons.filter,
        ),
        tooltip: Strings.actionFilter,
        onSelected: (value) {
          _bloc.add(FilterApplied(filter: value));
        },
        padding: EdgeInsets.zero,
        itemBuilder: (BuildContext context) {
          final allFilters = state.allFilters
              .map<PopupMenuEntry<Filter>>(
                (f) => PopupMenuItem<Filter>(
                  value: f,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisSize: MainAxisSize.max,
                    children: <Widget>[
                      Expanded(child: Text(f.name)),
                      Icon(
                        Icons.delete_outline,
                        size: 24.0,
                        color: Theme.of(context).iconTheme.color,
                      ),
                    ],
                  ),
                ),
              )
              .toList();
          final positionFilters = state.positionFilters
              .map<PopupMenuEntry<Filter>>(
                (f) => CustomPopupMenuItem(
                  value: f,
                  color: state.currentFilter.name == f.name
                      ? Colors.yellow[100]!
                      : Colors.transparent,
                  child: Text(f.name),
                ),
              )
              .toList();
          final parentList = allFilters + positionFilters;
          if (state.tagFilters.isNotEmpty) {
            parentList.add(
              PopupSubMenuItem<Filter>(
                title: Strings.passwordsFilterTagsList,
                items: state.tagFilters,
                selectedFilter: state.currentFilter,
                onSelected: (value) {
                  _bloc.add(FilterApplied(filter: value));
                },
              ),
            );
          }

          // if (state.userFilters.isNotEmpty && !remoteConfig.disableTeams) {
          //   parentList.add(PopupSubMenuItem<Filter>(
          //     title: Strings.passwordsFilterMembersList,
          //     items: state.userFilters,
          //     selectedFilter: state.currentFilter,
          //     onSelected: (value) {
          //       _bloc.add(FilterApplied(filter: value));
          //     },
          //   ));
          // }
          // if (state.teamFilters.isNotEmpty && !remoteConfig.disableTeams) {
          //   parentList.add(PopupSubMenuItem<Filter>(
          //     title: Strings.passwordsFilterTeamsList,
          //     items: state.teamFilters,
          //     selectedFilter: state.currentFilter,
          //     onSelected: (value) {
          //       _bloc.add(FilterApplied(filter: value));
          //     },
          //   ));
          // }
          if (state.otherFilters.isNotEmpty) {
            parentList.add(
              PopupSubMenuItem<Filter>(
                title: Strings.passwordsFilterOther,
                items: state.otherFilters,
                selectedFilter: state.currentFilter,
                onSelected: (value) {
                  _bloc.add(FilterApplied(filter: value));
                },
              ),
            );
          }
          return parentList;
        },
      );
    } else {
      return const SizedBox(width: 0.0);
    }
  }

  /// Get title to display on sorting order page
  String _sortingOrderTitle(PasswordSortingOrder order) {
    switch (order) {
      case PasswordSortingOrder.nameAZ:
        return Strings.sortingOrderNameAZ;
      case PasswordSortingOrder.nameZA:
        return Strings.sortingOrderNameZA;
      case PasswordSortingOrder.tagAZ:
        return Strings.sortingOrderTagAZ;
      case PasswordSortingOrder.tagZA:
        return Strings.sortingOrderTagZA;
      case PasswordSortingOrder.created:
        return Strings.sortingOrderCreated;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Select all passwords
  void _selectAllPasswords(BuildContext context) {
    _bloc.add(SelectAllPressed());
  }

  /// Deselect all passwords
  void _deselectAllPasswords(BuildContext context) {
    _bloc.add(DeselectAllPressed());
  }

  /// Share selected passwords
  Future<void> _shareSelectedPasswords(BuildContext context) async {
    BlocProvider.of<PasswordsBloc>(context).add(ShareSelectedPressed());
  }

  /// Delete selected passwords (with confirmation)
  void _deleteSelectedPasswords(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (BuildContext c) {
        return AlertDialog(
          content: Text(Strings.passwordsDeleteSelectedConfirmation),
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
                _bloc.add(DeleteSelectedPressed());
              },
            ),
          ],
        );
      },
    );
  }
}

class EditScreenAppBar extends StatelessWidget implements PreferredSizeWidget {
  const EditScreenAppBar({required this.state, super.key});

  final PasswordEditState state;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: true,
      title: Text(state.isNew ? Strings.passwordAdd : Strings.passwordEdit),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () {
          Navigator.of(context).pop();
        },
      ),
      actions: [
        state.uploadingFilesCount == 0
            ? IconButton(
                icon: Icon(
                  Icons.check,
                  color: Theme.of(context).primaryIconTheme.color,
                ),
                tooltip: Strings.actionConfirm,
                onPressed: () {
                  FocusScope.of(context).unfocus();
                  // _onSubmitPressed();
                  BlocProvider.of<PasswordEditBloc>(
                    context,
                  ).add(FormSubmitted());
                },
              )
            : const SizedBox(width: 0.0),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
