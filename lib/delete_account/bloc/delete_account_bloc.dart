part of '../index.dart';

class DeleteAccountBloc extends Bloc<DeleteAccountEvent, DeleteAccountState> {
  DeleteAccountBloc() : super(DeleteAccountState.initial()) {
    on<DeleteAccountEvent>((event, emit) async {
      if (event is RequestDeleteAccount) {
        emit(const DeleteAccountLoading());
        final result = await _deleteAccount(event.password);
        if (result.hasError) {
          emit(DeleteAccountErrorState(result.error?.message ?? ''));
        } else {
          emit(const DeleteAccountSucceedState());
        }
      }

      if (event is DeleteAccountEmailLinkSent) {
        emit(const DeleteAccountEmailSentState());
      }
    });
  }

  final ServerAdapter _server = ServerAdapter.get;

  Future<WebResult> _deleteAccount(String password) async {
    final String email = await Preferences().latestEmail ?? '';
    return await _server.removeAccount(email: email, password: password);
  }
}
