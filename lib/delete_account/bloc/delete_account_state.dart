part of '../index.dart';

class DeleteAccountState extends Equatable {
  const DeleteAccountState({required this.error, required this.isLoading});

  factory DeleteAccountState.initial() {
    return const DeleteAccountState(isLoading: false, error: '');
  }

  final bool isLoading;
  final String error;

  DeleteAccountState copyWith({bool? isLoading, String? error}) {
    return DeleteAccountState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [error, isLoading];
}

class DeleteAccountLoading extends DeleteAccountState {
  const DeleteAccountLoading() : super(isLoading: true, error: '');
}

class DeleteAccountErrorState extends DeleteAccountState {
  const DeleteAccountErrorState(this.err) : super(isLoading: false, error: err);

  final String err;
}

class DeleteAccountSucceedState extends DeleteAccountState {
  const DeleteAccountSucceedState() : super(isLoading: false, error: '');
}

class DeleteAccountEmailSentState extends DeleteAccountState {
  const DeleteAccountEmailSentState() : super(isLoading: false, error: '');
}
