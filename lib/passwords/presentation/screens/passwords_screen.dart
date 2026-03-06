part of '../../index.dart';

///Screen for displaying list of passwords
class PasswordsScreen extends StatelessWidget {
  final Settings _settings = Settings.get;

  /// Fires after making changes to passwords list
  /// [isSuccess] is *true* if changes were successfully saved to the server, and *false* in case of errors
  void _passwordsUpdateResult(BuildContext context, bool isSuccess) {
    if (isSuccess) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(Strings.passwordsUpdateSuccess)));
    } else {
      showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(Strings.passwordsUpdateFailTitle),
            content: Text(Strings.passwordsUpdateFailMessage),
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

  /// Fires after sharing passwords
  /// [isSuccess] is *true* if passwords were successfully shared, and *false* in case of errors
  void _passwordsShareResult(BuildContext context, bool isSuccess) {
    if (isSuccess) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(Strings.passwordsShareSuccess)));
    } else {
      showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(Strings.passwordsShareFailTitle),
            content: Text(Strings.passwordsShareFailMessage),
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

  /// Fires after locations was not successfully defined
  void _locationServiceError(BuildContext context) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(Strings.passwordsLocationError)));
  }

  /// Method to initiate viewing password details
  Future<void> _viewPasswordDetails(
    BuildContext context,
    Password password,
    int totalFilesAttached,
  ) async {
    final filesAttachedToOtherPasswords =
        totalFilesAttached - password.files.length;
    final result = await Navigator.push(
      context,
      MaterialPageRoute<Password>(
        builder: (context) => PasswordDetailsScreen(
          password,
          totalFilesAttached: totalFilesAttached,
        ),
      ),
    );
    if (result != null) {
      BlocProvider.of<p_word.PasswordsBloc>(
        context,
      ).add(p_word.PasswordUpdated(password: result));
      _viewPasswordDetails(
        context,
        result,
        filesAttachedToOtherPasswords + result.files.length,
      );
    }
  }

  /// Method to initiate password sharing
  Future<void> _sharePassword(BuildContext context, Password password) async {
    final readOnly = await Preferences().readonlyMode;
    if (readOnly == true) {
      Fluttertoast.showToast(msg: Strings.readOnlyToastAlert);
      return;
    }

    BlocProvider.of<p_word.PasswordsBloc>(
      context,
    ).add(p_word.PasswordSharePressed(password: password));
  }

  /// Method to initiate password editing
  Future<void> _editPassword(
    BuildContext context,
    Password password,
    int totalFilesAttached,
  ) async {
    final readOnly = await Preferences().readonlyMode;
    if (readOnly == true) {
      Fluttertoast.showToast(msg: Strings.readOnlyToastAlert);
      return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute<Password>(
        builder: (context) => PasswordEditScreen(
          password: password,
          totalFilesAttached: totalFilesAttached,
        ),
      ),
    );
    if (result != null) {
      BlocProvider.of<p_word.PasswordsBloc>(
        context,
      ).add(p_word.PasswordUpdated(password: result));
    }
  }

  /// Method to initiate deleting the password
  Future<void> _deletePassword(BuildContext context, Password password) async {
    final readOnly = await Preferences().readonlyMode;
    if (readOnly == true) {
      Fluttertoast.showToast(msg: Strings.readOnlyToastAlert);
      return;
    }

    showDialog<void>(
      context: context,
      builder: (c) {
        return AlertDialog(
          content: Text(Strings.passwordsDeleteConfirmation),
          actions: <Widget>[
            TextButton(
              child: Text(Strings.actionNo.toUpperCase()),
              onPressed: () {
                Navigator.of(c).pop();
              },
            ),
            TextButton(
              child: Text(Strings.actionYes.toUpperCase()),
              onPressed: () async {
                Navigator.of(c).pop();
                final readOnly = await Preferences().readonlyMode;
                if (readOnly == true) {
                  Fluttertoast.showToast(msg: Strings.readOnlyToastAlert);
                  return;
                }

                BlocProvider.of<p_word.PasswordsBloc>(
                  context,
                ).add(p_word.PasswordDeletePressed(password: password));
              },
            ),
          ],
        );
      },
    );
  }

  /// Method to show info of shared password
  void _showShareInfo(BuildContext context, Password password) {
    BlocProvider.of<p_word.PasswordsBloc>(
      context,
    ).add(p_word.PasswordShareInfoPressed(password: password));
    Scaffold.of(context).openEndDrawer();
  }

  //--------------------------------------------------------------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    return BlocListener<p_word.PasswordsBloc, p_word.PasswordsState>(
      listener: (context, state) async {
        // if (state is SessionExpiredState) {
        //   BlocProvider.of<AuthenticationBloc>(context)
        //       .add(SessionExpiredEvent());
        // }
        if (state is p_word.ConnectionErrorState) {
          // show error dialog
          connectionError(context, state.errorMessage);
        }
        if (state is p_word.PremiumRequiredState) {
          showPremiumRestrictionsDialog(context);
        }
        if (state is p_word.PasswordsSavedState) {
          _passwordsUpdateResult(context, state.isSavedSuccessfully);
        }
        if (state is p_word.PasswordsSharedState) {
          _passwordsShareResult(context, state.isSharedSuccessfully);
        }
        if (state is p_word.LocationServiceErrorState) {
          _locationServiceError(context);
        }
        if (state is p_word.SharingPermittedState) {
          final result = await Navigator.push(
            context,
            MaterialPageRoute<MemberPickerModel>(
              builder: (context) => MemberPickerScreen(
                checkSharingOptions: true,
                pickedMembers: state.passwordsToShare.length == 1
                    ? state.passwordsToShare.first.shares.entries
                          .where((e) => e.key != 0)
                          .map((e) {
                            return e.value.map(
                              (t) =>
                                  TeamMemberIdPair(memberId: e.key, teamId: t),
                            );
                          })
                          .expand((l) => l)
                          .toList()
                    : null,
                pickedTeams: state.passwordsToShare.length == 1
                    ? <int>{
                        ...state.passwordsToShare.first.shareTeamIds,
                        ...state.passwordsToShare.first.shares.entries
                            .where((e) => e.key == 0)
                            .expand((e) => e.value),
                      }
                    : null,
              ),
            ),
          );
          if (result != null) {
            BlocProvider.of<p_word.PasswordsBloc>(context).add(
              p_word.SharingMembersSelected(
                passwords: state.passwordsToShare.toList(),
                members: result.membersToSend,
                initialSelectedMembersAndTeams: result.initialMembersToSend,
              ),
            );
          }
        }
        if (state.veryFirstTimeLogin == true &&
            await _settings.getBoolean(
                  Settings.IS_LOGIN_VERY_FIRST_TIME_SETTING,
                ) !=
                true) {
          // if (true) {
          await _settings.setBoolean(
            Settings.IS_LOGIN_VERY_FIRST_TIME_SETTING,
            true,
          );

          if (Platform.isAndroid) {
            showDialog<void>(
              context: context,
              builder: (BuildContext context) => AlertDialog(
                title: SizedBox(
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).textScaler.scale(1) * 50,
                  child: AutoHyphenatingText(
                    Strings.loginPasswordManagerTitle,
                    style: Theme.of(
                      context,
                    ).textTheme.titleLarge?.copyWith(fontSize: 21),
                    softWrap: true,
                  ),
                ),
                content: Text(Strings.loginPasswordManagerMessage),
                actions: [
                  TextButton(
                    /// This parameter indicates this action is the default,
                    /// and turns the action's text to bold text.
                    onPressed: () async {
                      Navigator.pop(context);
                    },
                    child: Text(Strings.actionNo),
                  ),
                  TextButton(
                    /// This parameter indicates this action is the default,
                    /// and turns the action's text to bold text.
                    onPressed: () async {
                      Navigator.pop(context);
                      await AutofillService().requestSetAutofillService();
                    },
                    child: Text(Strings.loginPasswordManagerOption),
                  ),
                ],
              ),
            );
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
        }

        if (state is p_word.ShowSavePasswordToastState) {
          Fluttertoast.showToast(msg: Strings.messagePasswordSavedSuccess);
          SystemNavigator.pop();
        }

        if (state is p_word.ShowReadOnlyModeToastState) {
          Fluttertoast.showToast(msg: Strings.readOnlyToastAlert);
        }

        if (state is p_word.SaveOrUpdateConfirmationRequestedState) {
          // show dialog for the user to choose if he wants to
          // save new password or update the existing password
          final needToShowDialog = !BlocProvider.of<p_word.PasswordsBloc>(
            context,
          ).saveOrUpdateConfirmationShowing;
          if (needToShowDialog) {
            BlocProvider.of<p_word.PasswordsBloc>(
              context,
            ).saveOrUpdateConfirmationShowing = true;
            _showDialogSaveOrUpdateConfirmationDialog(context, state);
          }
        }
      },
      child: BlocBuilder<p_word.PasswordsBloc, p_word.PasswordsState>(
        builder: (context, state) {
          return Scaffold(
            body: Stack(
              children: [
                Column(
                  children: [
                    if (state.isReadOnlyMode == true)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 10.0),
                        child: Container(
                          width: double.infinity,
                          height: 35,
                          decoration: BoxDecoration(
                            color: PColors.grey.withValues(alpha: 0.9),
                          ),
                          child: Center(
                            child: Text(
                              Strings.readOnlyMode,
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(
                                    color: PColors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                            ),
                          ),
                        ),
                      ),
                    if (context
                        .watch<p_word.PasswordsBloc>()
                        .isLoadingPasswordFromAutofill)
                      _buildPickPasswordToUpdateTip()
                    else
                      const SizedBox(),
                    Expanded(child: _buildList(context, state)),
                  ],
                ),
                if (state.isLoading) const LinearProgressIndicator(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPickPasswordToUpdateTip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        Strings.messageSelectEntryToUpdate,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
          fontSize: 18,
        ),
      ),
      decoration: const BoxDecoration(color: Colors.black54),
    );
  }

  ///Method for generating widget for list of passwords
  Widget _buildList(BuildContext context, p_word.PasswordsState state) {
    if (state.isLoadingError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Text(
              Strings.passwordsErrorLoad,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              child: Text(Strings.actionRetry.toUpperCase()),
              onPressed: () {
                BlocProvider.of<p_word.PasswordsBloc>(
                  context,
                ).add(p_word.RetryPressed());
              },
            ),
          ],
        ),
      );
    }
    if (!state.isPasswordsAvailable) {
      return const SizedBox(width: 0.0);
    }
    if (state.filteredPasswords.isEmpty) {
      return state.isSearchVisible
          ? NoDataAvailable(
              icon: Icons.search,
              title: Strings.passwordsEmptyTitle,
              message: Strings.passwordsNotFoundMessage,
            )
          : state.currentFilter is GroupFilter
          ? NoDataAvailable(
              icon: Icons.local_offer,
              title: Strings.passwordsEmptyTitle,
              message: Strings.passwordsEmptyTagMessage,
            )
          : NoDataAvailable(
              icon: Icons.lock_outline,
              title: Strings.passwordsEmptyTitle,
              message: Strings.passwordsEmptyMessage,
            );
    }
    final remoteConfig = BlocProvider.of<ConfigurationBloc>(
      context,
    ).state.configuration;
    return RefreshIndicator(
      color: Theme.of(context).primaryIconTheme.color,
      backgroundColor: Theme.of(context).primaryColor,
      onRefresh: () {
        BlocProvider.of<p_word.PasswordsBloc>(
          context,
        ).add(p_word.RetryPressed());
        return Future<void>.delayed(const Duration(seconds: 1));
      },
      child: PasswordList(
        passwords: state.filteredPasswords.toList(),
        myMembers: state.myMembers.toList(),
        myTeams: state.myTeams.toList(),
        onItemClicked: (position, password) async {
          if (await _settings.getBoolean(Settings.IS_FROM_AUTO_FILL_REQUEST)) {
            BlocProvider.of<p_word.PasswordsBloc>(
              context,
            ).add(p_word.AutofillPasswordEvent(password: password));
          } else if (BlocProvider.of<p_word.PasswordsBloc>(
            context,
          ).isLoadingPasswordFromAutofill) {
            if (password.isShared) {
              // show dialog that this is a shared password and
              // you cannot edit/update it.
              if (Platform.isAndroid) {
                showDialog<void>(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: Text(Strings.loginPasswordManagerTitle),
                    content: Text(Strings.messageUnableToEditShare),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: Text(Strings.actionOk),
                      ),
                    ],
                  ),
                );
              } else {
                showCupertinoModalPopup<void>(
                  context: context,
                  barrierDismissible: false,
                  builder: (BuildContext context) => CupertinoAlertDialog(
                    title: Text(Strings.appName),
                    content: Text(Strings.messageUnableToEditShare),
                    actions: <CupertinoDialogAction>[
                      CupertinoDialogAction(
                        isDefaultAction: true,
                        onPressed: () => Navigator.of(context).pop(),
                        child: Text(Strings.actionOk),
                      ),
                    ],
                  ),
                );
              }
              return;
            }
            BlocProvider.of<p_word.PasswordsBloc>(context).add(
              p_word.UpdatePasswordFromAutofill(passwordToUpdate: password),
            );
          } else {
            if (state.selectionModeActive) {
              BlocProvider.of<p_word.PasswordsBloc>(
                context,
              ).add(p_word.PasswordPressed(password: password));
            } else {
              _viewPasswordDetails(context, password, state.totalFilesUploaded);
            }
          }
        },
        onItemLongClicked: (position, password) {
          if (!state.isFromAutoFillRequestedApp) {
            BlocProvider.of<p_word.PasswordsBloc>(
              context,
            ).add(p_word.PasswordLongPressed(password: password));
          }
        },
        onItemShare: (position, password) => _sharePassword(context, password),
        onItemEdit: (position, password) =>
            _editPassword(context, password, state.totalFilesUploaded),
        onItemDeleted: (position, password) =>
            _deletePassword(context, password),
        onShareInfoClicked: (position, password) =>
            _showShareInfo(context, password),
        isSharingAvailable:
            BlocProvider.of<AuthenticationBloc>(
              context,
            ).isVerifiedFeaturesAvailable &&
            !remoteConfig.disableTeams,
        isSelectionMode: state.selectionModeActive,
        selectedIds: state.selectedPasswordIds.toSet(),
      ),
    );
  }

  void _showDialogSaveOrUpdateConfirmationDialog(
    BuildContext context,
    p_word.SaveOrUpdateConfirmationRequestedState state,
  ) {
    if (Platform.isAndroid) {
      showDialog<void>(
        context: context,
        builder: (_) => PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool? pop, result) {},
          child: AlertDialog(
            title: Text(Strings.loginPasswordManagerTitle),
            content: Text(Strings.messageSaveUpdateConfirmTitle),
            actions: [
              TextButton(
                onPressed: () async => _onTappedCancel(context),
                child: Text(Strings.actionNo),
              ),
              TextButton(
                onPressed: () => _onTappedSaveNew(context, state),
                child: Text(Strings.actionSaveNewPassword),
              ),
              TextButton(
                onPressed: () => _onTappedUpdateExisting(context),
                child: Text(Strings.actionUpdateExistingPassword),
              ),
            ],
          ),
        ),
      );
    } else {
      //Navigator.of(context).pop();
      showCupertinoModalPopup<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) => CupertinoAlertDialog(
          title: Text(Strings.appName),
          content: Text(Strings.messageSaveUpdateConfirmTitle),
          actions: <CupertinoDialogAction>[
            CupertinoDialogAction(
              isDefaultAction: true,
              onPressed: () => _onTappedCancel(context),
              child: Text(Strings.actionCancel),
            ),
            CupertinoDialogAction(
              isDefaultAction: true,
              onPressed: () => _onTappedUpdateExisting(context),
              child: Text(Strings.actionCancel),
            ),
            CupertinoDialogAction(
              isDefaultAction: true,
              onPressed: () => _onTappedSaveNew(context, state),
              child: Text(Strings.actionSaveNewPassword),
            ),
          ],
        ),
      );
    }
  }

  void _onTappedCancel(BuildContext context) {
    BlocProvider.of<p_word.PasswordsBloc>(
      context,
    ).saveOrUpdateConfirmationShowing = false;
    Navigator.pop(context);
    SystemNavigator.pop();
  }

  void _onTappedSaveNew(
    BuildContext context,
    p_word.SaveOrUpdateConfirmationRequestedState state,
  ) {
    BlocProvider.of<p_word.PasswordsBloc>(
      context,
    ).saveOrUpdateConfirmationShowing = false;
    BlocProvider.of<p_word.PasswordsBloc>(context).add(
      p_word.SaveNewPasswordFromAutofill(
        receivedPassword: state.receivedPassword,
        membersList: state.membersList,
        teamsList: state.teamsList,
        passwords: state.passwords,
      ),
    );
    Navigator.pop(context);
    // await AutofillService().requestSetAutofillService();
  }

  void _onTappedUpdateExisting(BuildContext context) {
    BlocProvider.of<p_word.PasswordsBloc>(
      context,
    ).saveOrUpdateConfirmationShowing = false;
    BlocProvider.of<p_word.PasswordsBloc>(
      context,
    ).add(const p_word.LoadInitialPasswordsForUpdateFromAutofill());
    Navigator.pop(context);
  }
}
