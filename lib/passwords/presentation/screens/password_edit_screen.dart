part of '../../index.dart';

///Various types to use when uploading documents
enum FileUploadType { none, image, pdf, other }

///Screen for editing password
class PasswordEditScreen extends StatelessWidget {
  const PasswordEditScreen({this.password, this.totalFilesAttached = 0});

  final Password? password;
  final int totalFilesAttached;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<p_word_edit.PasswordEditBloc>(
      create: (_) => p_word_edit.PasswordEditBloc(
        password: password,
        isPremium: BlocProvider.of<AuthenticationBloc>(
          context,
        ).isPremiumFeaturesAvailable,
        totalFilesAttached: totalFilesAttached,
      ),
      child: PasswordEditForm(),
    );
  }
}

//----------------------------------------------------------------------------------------------------------------------

///Widget to edit data of specific password
class PasswordEditForm extends StatefulWidget {
  @override
  State createState() => _PasswordEditFormState();
}

class _PasswordEditFormState extends State<PasswordEditForm> {
  late final p_word_edit.PasswordEditBloc _bloc;
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _urlController = TextEditingController();
  final _notesController = TextEditingController();
  final _locationTitleController = TextEditingController();
  final _locationLatitudeController = TextEditingController();
  final _locationLongitudeController = TextEditingController();
  final _locationAccuracyController = TextEditingController();
  final _locationAddressController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<p_word_edit.PasswordEditBloc>(context);
    _nameController.addListener(_onNameChanged);
    _usernameController.addListener(_onUsernameChanged);
    _passwordController.addListener(_onPasswordChanged);
    _urlController.addListener(_onUrlChanged);
    _notesController.addListener(_onNotesChanged);
    _locationTitleController.addListener(_onLocationTitleChanged);
    _locationLatitudeController.addListener(_onLocationLatitudeChanged);
    _locationLongitudeController.addListener(_onLocationLongitudeChanged);
    _locationAccuracyController.addListener(_onLocationAccuracyChanged);
    _locationAddressController.addListener(_onLocationAddressChanged);
  }

  void _initControllers(p_word_edit.PasswordEditState state) {
    if (_nameController.text != state.name) {
      _nameController.value = _nameController.value.copyWith(text: state.name);
    }
    if (_usernameController.text != state.username) {
      _usernameController.value = _usernameController.value.copyWith(
        text: state.username,
      );
    }
    if (_passwordController.text != state.password) {
      _passwordController.value = _passwordController.value.copyWith(
        text: state.password,
      );
    }
    if (_urlController.text != state.url) {
      _urlController.value = _urlController.value.copyWith(text: state.url);
    }
    if (_notesController.text != state.notes) {
      _notesController.value = _notesController.value.copyWith(
        text: state.notes,
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _urlController.dispose();
    _notesController.dispose();
    _locationTitleController.dispose();
    _locationLatitudeController.dispose();
    _locationLongitudeController.dispose();
    _locationAccuracyController.dispose();
    _locationAddressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthenticationBloc, AuthenticationState>(
      listener: (context, state) async {
        if (state is Unauthenticated) {
          Navigator.of(context).pop();
        }
      },
      child: BlocListener<p_word_edit.PasswordEditBloc, p_word_edit.PasswordEditState>(
        listener: _blocCommandListener,
        child:
            BlocBuilder<
              p_word_edit.PasswordEditBloc,
              p_word_edit.PasswordEditState
            >(
              builder: (context, state) {
                _initControllers(state);
                return PopScope(
                  // canPop: false,
                  onPopInvokedWithResult: (bool? pop, result) {
                    if (_scaffoldKey.currentState?.isEndDrawerOpen == false) {
                    } else {
                      ///REMOVE THE END DRAWER FIRST BEFORE EXITING THE EDIT SCREEN
                      ///FOR NOW I LEFT IT COMMENTED BECAUSE I HAVE NOT BEEN ABLE TO EXPERIMENT THE USE CASE
                      // Navigator.of(context).pop();
                      _onCancelPressed();
                    }
                  },
                  child: Scaffold(
                    key: _scaffoldKey,
                    appBar: EditScreenAppBar(state: state),
                    // appBar: _buildAppBar(context, state),
                    body: PasswordEditBody(
                      state: state,
                      nameController: _nameController,
                      usernameController: _usernameController,
                      urlController: _urlController,
                      passwordController: _passwordController,
                      notesController: _notesController,
                      scaffoldKey: _scaffoldKey,
                    ),
                    // body: _buildBody(context, state),
                    endDrawer: GestureDetector(
                      onTap: () {
                        final FocusScopeNode currentFocus = FocusScope.of(
                          context,
                        );
                        if (!currentFocus.hasPrimaryFocus) {
                          currentFocus.unfocus();
                        }
                      },
                      child: _buildEndDrawer(context, state),
                    ),
                    drawerEdgeDragWidth: 0.0,
                  ),
                );
              },
            ),
      ),
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  Widget _buildEndDrawer(
    BuildContext context,
    p_word_edit.PasswordEditState state,
  ) {
    switch (state.drawerPage) {
      case p_word_edit.DrawerPage.selectTags:
        return TagsEndDrawer(state: state, scaffoldKey: _scaffoldKey);
      case p_word_edit.DrawerPage.addLocation:
        return LocationEndDrawer(
          state: state,
          isNew: true,
          titleController: _locationTitleController,
          accuracyController: _locationAccuracyController,
          latitudeController: _locationLatitudeController,
          longitudeController: _locationLongitudeController,
          scaffoldKey: _scaffoldKey,
        );
      case p_word_edit.DrawerPage.editLocation:
        return LocationEndDrawer(
          state: state,
          isNew: false,
          titleController: _locationTitleController,
          accuracyController: _locationAccuracyController,
          latitudeController: _locationLatitudeController,
          longitudeController: _locationLongitudeController,
          scaffoldKey: _scaffoldKey,
        );
      case p_word_edit.DrawerPage.getAddress:
        return AddressEndDrawer(
          state: state,
          addressController: _locationAddressController,
        );
      case p_word_edit.DrawerPage.none:
        return const SizedBox(height: 0.0);
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  void _onNameChanged() {
    _bloc.add(p_word_edit.NameChanged(name: _nameController.text));
  }

  void _onUsernameChanged() {
    _bloc.add(p_word_edit.UsernameChanged(username: _usernameController.text));
  }

  void _onPasswordChanged() {
    _bloc.add(p_word_edit.PasswordChanged(password: _passwordController.text));
  }

  void _onUrlChanged() {
    _bloc.add(p_word_edit.UrlChanged(url: _urlController.text));
  }

  void _onNotesChanged() {
    _bloc.add(p_word_edit.NotesChanged(notes: _notesController.text));
  }

  void _onLocationTitleChanged() {
    _bloc.add(
      p_word_edit.LocationTitleChanged(title: _locationTitleController.text),
    );
  }

  void _onLocationLatitudeChanged() {
    _bloc.add(
      p_word_edit.LocationLatitudeChanged(
        latitude: _locationLatitudeController.text,
      ),
    );
  }

  void _onLocationLongitudeChanged() {
    _bloc.add(
      p_word_edit.LocationLongitudeChanged(
        longitude: _locationLongitudeController.text,
      ),
    );
  }

  void _onLocationAccuracyChanged() {
    _bloc.add(
      p_word_edit.LocationAccuracyChanged(
        accuracy: _locationAccuracyController.text,
      ),
    );
  }

  void _onLocationAddressChanged() {
    _bloc.add(
      p_word_edit.LocationAddressChanged(
        address: _locationAddressController.text,
      ),
    );
  }

  void _onCancelPressed() {
    FocusScope.of(context).unfocus();
    _bloc.add(p_word_edit.FormCanceled());
  }

  /// Upload file
  Future<void> _uploadFile(BuildContext context) async {
    final FileUploadType picked =
        await showDialog<FileUploadType>(
          context: context,
          builder: (BuildContext dialogContext) {
            return AlertDialog(
              title: Text(Strings.uploadFileTitle),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SizedBox(height: 16.0),
                  Text(
                    Strings.uploadFileChooseType,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 12.0),
                  ListTile(
                    title: Text(Strings.uploadFileTypeImage),
                    leading: const Icon(Icons.image),
                    onTap: () {
                      Navigator.of(dialogContext).pop(FileUploadType.image);
                    },
                  ),
                  ListTile(
                    title: Text(Strings.uploadFileTypePDF),
                    leading: const Icon(Icons.picture_as_pdf),
                    onTap: () {
                      Navigator.of(dialogContext).pop(FileUploadType.pdf);
                    },
                  ),
                  ListTile(
                    title: Text(Strings.uploadFileTypeOther),
                    leading: const Icon(Icons.insert_drive_file),
                    onTap: () {
                      Navigator.of(dialogContext).pop(FileUploadType.other);
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
        ) ??
        FileUploadType.none;
    FilePickerResult? result;
    switch (picked) {
      case FileUploadType.image:
        result = await FilePicker.platform.pickFiles(type: FileType.image);
        break;
      case FileUploadType.pdf:
        result = await FilePicker.platform.pickFiles(
          type: FileType.custom,
          allowedExtensions: ['pdf'],
        );
        break;
      case FileUploadType.other:
        result = await FilePicker.platform.pickFiles(type: FileType.any);
        break;
      default:
        result = null;
        break;
    }
    if (result != null) {
      _bloc.add(
        p_word_edit.FileForUploadPicked(path: result.files.single.path ?? ''),
      );
    }
  }

  /// Listener for specific Bloc states
  Future<void> _blocCommandListener(
    BuildContext context,
    p_word_edit.PasswordEditState state,
  ) async {
    if (_scaffoldKey.currentState?.isEndDrawerOpen == true &&
        state.drawerPage == p_word_edit.DrawerPage.none) {
      Navigator.of(context).pop();
    }
    if (state is p_word_edit.TagCreationPermittedState) {
      _createNewTag(context);
    }
    if (state is p_word_edit.FileUploadPermittedState) {
      _uploadFile(context);
    }
    if (state is p_word_edit.FileUploadResultState) {
      String text;
      switch (state.uploadResult) {
        case p_word_edit.FileUploadResult.success:
          text = Strings.uploadFileResultSuccess;
          break;
        case p_word_edit.FileUploadResult.storageFull:
          text = Strings.uploadFileResultStorageFull;
          break;
        case p_word_edit.FileUploadResult.largerThan1Mb:
        case p_word_edit.FileUploadResult.otherError:
          text = Strings.uploadFileResultFail;
          break;
      }
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(text),
            action: state.errorDetails?.isNotEmpty == true
                ? SnackBarAction(
                    label: Strings.actionDetails.toUpperCase(),
                    onPressed: () {
                      showDialog<void>(
                        context: context,
                        builder: (context) {
                          return AlertDialog(
                            title: Text(Strings.passwordError),
                            content: Text(state.errorDetails!),
                            actions: <Widget>[
                              TextButton(
                                child: Text(Strings.actionOk),
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                              ),
                            ],
                          );
                        },
                      );
                    },
                  )
                : null,
          ),
        );
    }
    if (state is p_word_edit.FinishEditState) {
      Navigator.of(context).pop(state.result);
    }
    if (state is p_word_edit.ConfirmDiscardChangesState) {
      final bool result =
          await showDialog<bool>(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                content: Text(Strings.passwordDiscardChangesPrompt),
                actions: [
                  TextButton(
                    child: Text(Strings.actionNo.toUpperCase()),
                    onPressed: () {
                      Navigator.of(context).pop(false);
                    },
                  ),
                  TextButton(
                    child: Text(Strings.actionYes.toUpperCase()),
                    onPressed: () {
                      Navigator.of(context).pop(true);
                    },
                  ),
                ],
              );
            },
          ) ??
          false;
      _bloc.add(p_word_edit.ConfirmationSubmitted(isConfirmed: result));
    }
    if (state is p_word_edit.PremiumRequiredState) {
      showPremiumRestrictionsDialog(context);
    }
    if (state is p_word_edit.SessionExpiredState) {
      BlocProvider.of<AuthenticationBloc>(context).add(SessionExpiredEvent());
    }
    if (state is p_word_edit.ConnectionErrorState) {
      connectionError(context, state.errorMessage);
    }
  }

  /// Method for new tag creation
  Future<void> _createNewTag(BuildContext context) async {
    final name = await showEditTextDialog(
      context,
      title: Strings.passwordTagsCreateNew,
      hint: Strings.passwordTagsName,
      emptyMessage: Strings.passwordTagsNameEmpty,
      positiveTitle: Strings.actionCreate,
      cancelTitle: Strings.actionCancel,
    );
    if (name != null) {
      _bloc.add(p_word_edit.NewTagAdded(name: name));
    }
  }
}
