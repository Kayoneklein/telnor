part of '../index.dart';

class UserInfoBloc extends Bloc<UserInfoEvent, UserInfoState> {
  UserInfoBloc() : super(UserInfoState.initial()) {
    _loadUserInfo();

    on<UserInfoEvent>((event, emit) {
      //Info loaded
      if (event is UserInfoLoaded) {
        emit(state.copyWith(
          isInitialized: true,
          isLoading: false,
          name: event.user.name,
          department: event.user.department,
          avatar: event.user.avatar,
        ));
      }
      //Name changed
      if (event is NameChanged) {
        emit(state.copyWith(
          name: event.name,
        ));
      }
      //Department changed
      if (event is DepartmentChanged) {
        emit(state.copyWith(
          department: event.department,
        ));
      }
      //User changed avatar image
      if (event is AvatarChanged) {
        emit(state.copyWith(
          isLoading: true,
        ));
        _resizeImage(event.file);
      }
      //Finished resizing image
      if (event is AvatarProcessed) {
        emit(state.copyWith(
          isLoading: false,
          avatar: event.data,
        ));
      }
      //Avatar deleted
      if (event is DeleteAvatarPressed) {
        emit(state.copyWith(
          avatar: Uint8List(0),
        ));
      }
      //Apply changes
      if (event is ChangesConfirmed) {
        emit(state.copyWith(isLoading: true));
        _saveUserInfo();
      }
      //Saving finished
      if (event is UserInfoSaved) {
        emit(UserInfoSavedState.from(state.copyWith(isLoading: false),
            isSuccess: event.isSuccess));
      }
      //Discard changes
      if (event is BackButtonPressed) {
        if (needToShowConfirmationDialog()) {
          emit(ShowDiscardDialogState.from(state));
        } else {
          emit(NavigateBackState.from(state));
        }
      }
      //Answer dialog question
      if (event is DialogConfirmationReceived) {
        if (event.isYes) {
          emit(NavigateBackState.from(state));
        } else {
          emit(state.copyWith());
        }
      }
      //Session expired
      if (event is SessionExpired) {
        emit(SessionExpiredState());
      }

      if (event is ConnectionErrorEvent) {
        emit(
            ConnectionErrorState.from(state, errorMessage: event.errorMessage));
      }
    });
  }

  late User _originalUser;
  final ServerAdapter _server = ServerAdapter.get;
  final Settings _settings = Settings.get;

  /// Load current user info
  Future<void> _loadUserInfo() async {
    try {
      _originalUser = await _settings.getCurrentUser();
      add(UserInfoLoaded(user: _originalUser));
    } catch (error) {
      //!!!
    }
  }

  /// Save new user info
  Future<void> _saveUserInfo() async {
    final user = _originalUser.copyWith(
      name: state.name,
      department: state.department,
      avatar: state.avatar,
    );
    _server.updateUserInfo(
      user: user,
      onSuccess: () async {
        await _settings.setCurrentUser(user);
        add(const UserInfoSaved(isSuccess: true));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(error.isSessionExpired
              ? SessionExpired()
              : const UserInfoSaved(isSuccess: false));
        }
      },
    );
  }

  /// Defines whether confirmation dialog about discarding changes is needed
  bool needToShowConfirmationDialog() {
    return state.isInitialized &&
        (state.name != _originalUser.name ||
            state.department != _originalUser.department ||
            state.avatar != _originalUser.avatar);
  }

  /// Resize avatar image to save memory
  Future<void> _resizeImage(File file) async {
    final image = decodeImage(file.readAsBytesSync());
    if (image != null) {
      final resized = (image.height > image.width ||
              image.exif.exifIfd.orientation == 8) //Todo
          ? copyResize(image, width: 150)
          : copyResize(image, height: 150);
      final bytes = encodePng(resized);
      add(AvatarProcessed(data: Uint8List.fromList(bytes)));
    }
  }
}
