part of '../index.dart';

///Screen for showing user info
class UserInfoScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider<UserInfoBloc>(
      create: (context) => UserInfoBloc(),
      child: UserInfoForm(),
    );
  }
}

//======================================================================================================================

class UserInfoForm extends StatefulWidget {
  @override
  State createState() => _UserInfoFormState();
}

class _UserInfoFormState extends State<UserInfoForm> {
  late final UserInfoBloc _bloc;
  final _nameController = TextEditingController();
  final _departmentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<UserInfoBloc>(context);
    _nameController.addListener(_onNameChanged);
    _departmentController.addListener(_onDepartmentChanged);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _departmentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<UserInfoBloc, UserInfoState>(
      listener: _stateChangeListener,
      child: BlocBuilder<UserInfoBloc, UserInfoState>(
        builder: (context, state) {
          if (_nameController.text != state.name) {
            _nameController.value = _nameController.value.copyWith(
              text: state.name,
            );
          }
          if (_departmentController.text != state.department) {
            _departmentController.value = _departmentController.value.copyWith(
              text: state.department,
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(Strings.userInfoTitle),
              centerTitle: false,
              leading: PopScope(
                canPop: false,
                onPopInvokedWithResult: (bool? pop, fn) {},
                child: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => _backButtonPressed(context),
                ),
              ),
              actions: state.isInitialized
                  ? [
                      IconButton(
                        icon: const Icon(Icons.check),
                        tooltip: Strings.actionConfirm,
                        onPressed: () {
                          if (!state.isLoading) {
                            _confirmButtonPressed(context);
                          }
                        },
                      ),
                    ]
                  : [],
            ),
            body: Stack(
              children: <Widget>[
                if (state.isInitialized)
                  Scrollbar(
                    child: SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              Strings.userInfoName,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            TextFormField(
                              controller: _nameController,
                              style: Theme.of(context).textTheme.headlineSmall,
                              textInputAction: TextInputAction.next,
                              textCapitalization: TextCapitalization.words,
                              onFieldSubmitted: (v) {
                                FocusScope.of(context).nextFocus();
                              },
                            ),
                            const SizedBox(height: 24.0),
                            Text(
                              Strings.userInfoDepartment,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            TextFormField(
                              controller: _departmentController,
                              style: Theme.of(context).textTheme.headlineSmall,
                              textInputAction: TextInputAction.done,
                              textCapitalization: TextCapitalization.words,
                              onFieldSubmitted: (v) {
                                FocusScope.of(context).unfocus();
                              },
                            ),
                            const SizedBox(height: 24.0),
                            Text(
                              Strings.userInfoAvatar,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            const SizedBox(height: 16.0),
                            Stack(
                              children: <Widget>[
                                CircleAvatar(
                                  radius: 75.0,
                                  backgroundColor: Colors.grey[300],
                                  backgroundImage: state.avatar.isNotEmpty
                                      ? MemoryImage(state.avatar)
                                            as ImageProvider
                                      : const AssetImage(PImages.userDefault),
                                ),
                                Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    child: const SizedBox(
                                      width: 150.0,
                                      height: 150.0,
                                    ),
                                    borderRadius: BorderRadius.circular(75.0),
                                    onTap: _onAvatarPressed,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16.0),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: PColors.blue,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8,
                                  horizontal: 30,
                                ),
                                // fixedSize: const Size(150, 30),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              onPressed: _onDeleteAvatarPressed,
                              child: Text(
                                Strings.userInfoDeleteAvatar,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(
                                      color: PColors.white,
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                            ),
                            const SizedBox(height: 30.0),
                            OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8,
                                  horizontal: 20,
                                ),
                                side: BorderSide(color: PColors.blue),
                                // fixedSize: const Size(150, 30),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute<void>(
                                    builder: (context) => const DeleteAccount(),
                                  ),
                                );
                              },
                              child: Text(
                                Strings.deleteAccountRemoveAccount,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(
                                      color: PColors.blue,
                                      fontWeight: FontWeight.w700,
                                      // decoration: TextDecoration.underline,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                if (state.isLoading) const LinearProgressIndicator(),
              ],
            ),
          );
        },
      ),
    );
  }

  /// Triggers when state changes
  Future<void> _stateChangeListener(
    BuildContext context,
    UserInfoState state,
  ) async {
    if (state is ShowDiscardDialogState) {
      final bool? isYes =
          await showDialog<bool?>(
            context: context,
            builder: (BuildContext dialogContext) {
              return AlertDialog(
                content: Text(Strings.userInfoDiscardChanges),
                actions: <Widget>[
                  TextButton(
                    child: Text(Strings.actionNo.toUpperCase()),
                    onPressed: () {
                      Navigator.of(dialogContext).pop(false);
                    },
                  ),
                  TextButton(
                    child: Text(Strings.actionYes.toUpperCase()),
                    onPressed: () {
                      Navigator.of(dialogContext).pop(true);
                    },
                  ),
                ],
              );
            },
          ) ??
          false;
      _bloc.add(DialogConfirmationReceived(isYes: isYes ?? false));
    }
    if (state is UserInfoSavedState) {
      if (state.isSuccess) {
        BlocProvider.of<AuthenticationBloc>(
          context,
        ).add(UserInfoChangedEvent());
        Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(Strings.userInfoSaveError)));
      }
    }
    if (state is SessionExpiredState) {
      BlocProvider.of<AuthenticationBloc>(context).add(SessionExpiredEvent());
    }
    if (state is ConnectionErrorState) {
      // show error dialog
      connectionError(context, state.errorMessage);
    }
    if (state is NavigateBackState) {
      Navigator.of(context).pop();
    }
  }

  void _onNameChanged() {
    _bloc.add(NameChanged(name: _nameController.text));
  }

  void _onDepartmentChanged() {
    _bloc.add(DepartmentChanged(department: _departmentController.text));
  }

  Future<void> _onAvatarPressed() async {
    final ImageSource? source = await showDialog<ImageSource?>(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(Strings.userInfoUploadAvatar),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const SizedBox(height: 16.0),
              Text(
                Strings.userInfoChooseAvatarSource,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 12.0),
              ListTile(
                title: Text(Strings.userInfoAvatarSourcePhoto),
                leading: const Icon(Icons.photo_camera),
                onTap: () {
                  Navigator.of(dialogContext).pop(ImageSource.camera);
                },
              ),
              ListTile(
                title: Text(Strings.userInfoAvatarSourceGallery),
                leading: const Icon(Icons.image),
                onTap: () {
                  Navigator.of(dialogContext).pop(ImageSource.gallery);
                },
              ),
            ],
          ),
          actions: <Widget>[
            TextButton(
              child: Text(Strings.actionCancel.toUpperCase()),
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
            ),
          ],
        );
      },
    );
    if (source != null) {
      final file = await ImagePicker().pickImage(source: source);
      if (file != null) {
        _bloc.add(AvatarChanged(file: File(file.path)));
      }
    }
  }

  void _onDeleteAvatarPressed() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          content: Padding(
            padding: const EdgeInsets.only(top: 10.0),
            child: Text(
              Strings.deleteConfirmation,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: [
            TextButton(
              onPressed: () {
                _bloc.add(DeleteAvatarPressed());
                Navigator.pop(context);
              },
              style: OutlinedButton.styleFrom(
                backgroundColor: PColors.darkBlue,
                fixedSize: Size(MediaQuery.of(context).size.width * 0.65, 40),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                Strings.delete,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: PColors.white),
              ),
            ),
          ],
        );
      },
    );
  }

  void _confirmButtonPressed(BuildContext context) {
    FocusScope.of(context).unfocus();
    _bloc.add(ChangesConfirmed());
  }

  void _backButtonPressed(BuildContext context) {
    FocusScope.of(context).unfocus();
    _bloc.add(BackButtonPressed());
  }
}
