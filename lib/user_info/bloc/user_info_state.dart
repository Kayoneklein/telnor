part of '../index.dart';

class UserInfoState extends Equatable {
  const UserInfoState({
    required this.isInitialized,
    required this.isLoading,
    required this.name,
    required this.department,
    required this.avatar,
  });

  factory UserInfoState.initial() => UserInfoState(
        isInitialized: false,
        isLoading: true,
        name: '',
        department: '',
        avatar: Uint8List(0),
      );

  final bool isInitialized;
  final bool isLoading;
  final String name;
  final String department;
  final Uint8List avatar;

  UserInfoState copyWith({
    bool? isInitialized,
    bool? isLoading,
    String? name,
    String? department,
    Uint8List? avatar,
  }) =>
      UserInfoState(
        isInitialized: isInitialized ?? this.isInitialized,
        isLoading: isLoading ?? this.isLoading,
        name: name ?? this.name,
        department: department ?? this.department,
        avatar: avatar ?? this.avatar,
      );

  @override
  List<Object> get props => [
        isInitialized,
        isLoading,
        name,
        department,
        avatar,
      ];
}

/// State to indicate the need to show confirmation dialog
class ShowDiscardDialogState extends UserInfoState {
  ShowDiscardDialogState.from(UserInfoState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          name: state.name,
          department: state.department,
          avatar: state.avatar,
        );
}

/// State to indicate the finish of data saving process
class UserInfoSavedState extends UserInfoState {
  UserInfoSavedState.from(UserInfoState state, {required this.isSuccess})
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          name: state.name,
          department: state.department,
          avatar: state.avatar,
        );

  final bool isSuccess;

  @override
  List<Object> get props => [
        isInitialized,
        isLoading,
        name,
        department,
        avatar,
        isSuccess,
      ];
}

/// State to indicate the need to go back
class NavigateBackState extends UserInfoState {
  NavigateBackState.from(UserInfoState state)
      : super(
          isInitialized: state.isInitialized,
          isLoading: state.isLoading,
          name: state.name,
          department: state.department,
          avatar: state.avatar,
        );
}

/// State to indicate the expired session
class SessionExpiredState extends UserInfoState {
  SessionExpiredState()
      : super(
          isInitialized: false,
          isLoading: false,
          name: '',
          department: '',
          avatar: Uint8List(0),
        );
}

class ConnectionErrorState extends UserInfoState {
  ConnectionErrorState.from(UserInfoState state, {required this.errorMessage})
      : super(
          isInitialized: state.isInitialized,
          isLoading: false,
          name: state.name,
          department: state.department,
          avatar: state.avatar,
        );

  final String errorMessage;

  @override
  List<Object> get props => [
        isInitialized,
        isLoading,
        name,
        department,
        avatar,
        errorMessage,
      ];
}
