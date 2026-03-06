import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:bloc/bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:telnor/model/attachment.dart';
import 'package:telnor/model/pcrypt_key.dart';
import 'package:telnor/web/server_adapter.dart';

import 'file_viewer.dart';

class FileViewerBloc extends Bloc<FileViewerEvent, FileViewerState> {
  FileViewerBloc({
    required Attachment file,
    required int? ownerId,
    required PCryptKey? publicKey,
    required int? teamId,
    required String? teamKey,
  }) : _file = file,
       _ownerId = ownerId ?? -1,
       _publicKey = publicKey,
       _teamId = teamId ?? -1,
       _teamKey = teamKey,
       super(FileViewerState.initial(file.name)) {
    _loadFileData();

    on<FileViewerEvent>((event, emit) {
      //File loaded
      if (event is FileLoaded) {
        if (event.isSuccess) {
          emit(
            state.copyWith(
              isLoading: false,
              isError: false,
              fileFormat: event.fileFormat,
              fileData: event.fileData,
            ),
          );
        } else {
          emit(
            state.copyWith(
              isLoading: false,
              isError: true,
              fileFormat: FileFormat.none,
            ),
          );
        }
      }
      //Retry pressed
      if (event is RetryPressed) {
        emit(state.copyWith(isLoading: true));
        _loadFileData();
      }
      // Session expired
      if (event is SessionExpired) {
        emit(SessionExpiredState.from(state));
      }
      if (event is ConnectionErrorEvent) {
        emit(
          ConnectionErrorState.from(state, errorMessage: event.errorMessage),
        );
      }
    });
  }

  final Attachment _file;
  final int _ownerId;
  final PCryptKey? _publicKey;
  final int _teamId;
  final String? _teamKey;
  final ServerAdapter _server = ServerAdapter.get;

  /*  @override
  Stream<FileViewerState> mapEventToState(
    FileViewerEvent event,
  ) async* {
    //File loaded
    if (event is FileLoaded) {
      if (event.isSuccess) {
        yield state.copyWith(
          isLoading: false,
          isError: false,
          fileFormat: event.fileFormat,
          fileData: event.fileData,
        );
      } else {
        yield state.copyWith(
          isLoading: false,
          isError: true,
          fileFormat: FileFormat.none,
        );
      }
    }
    //Retry pressed
    if (event is RetryPressed) {
      yield state.copyWith(
        isLoading: true,
      );
      _loadFileData();
    }
    // Session expired
    if (event is SessionExpired) {
      yield SessionExpiredState.from(state);
    }
    if (event is ConnectionErrorEvent) {
      yield ConnectionErrorState.from(state, errorMessage: event.errorMessage);
    }
  }*/

  //--------------------------------------------------------------------------------------------------------------------

  /// Load binary data of current file attachment
  Future<void> _loadFileData() async {
    FileFormat format = FileFormat.unknown;
    switch (_file.type) {
      case 'image/bmp':
      case 'image/gif':
      case 'image/jpeg':
      case 'image/png':
        format = FileFormat.image;
        break;
      case 'application/pdf':
        format = FileFormat.pdf;
        break;
      case 'text/plain':
        format = FileFormat.text;
        break;
      //TODO other formats
    }
    if (format != FileFormat.unknown) {
      final onSuccess = (Uint8List data) async {
        try {
          final path = await _writeTempFile(data);
          add(FileLoaded(isSuccess: true, fileFormat: format, fileData: path));
        } catch (error) {
          add(const FileLoaded(isSuccess: false));
        }
      };
      final onError = (AdapterError error) {
        if (error.isSessionExpired) {
          add(SessionExpired());
        } else if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else {
          add(const FileLoaded(isSuccess: false));
        }
      };

      if (_isSharedByTeam) {
        _server.loadTeamSharedFile(
          fileId: _file.id,
          teamId: _teamId,
          teamKey: _teamKey!,
          onSuccess: onSuccess,
          onError: onError,
        );
      } else if (_isSharedByUser) {
        _server.loadUserSharedFile(
          fileId: _file.id,
          ownerId: _ownerId,
          publicKey: _publicKey,
          onSuccess: onSuccess,
          onError: onError,
        );
      } else {
        _server.loadFile(
          fileId: _file.id,
          onSuccess: onSuccess,
          onError: onError,
        );
      }
    } else {
      add(const FileLoaded(isSuccess: true, fileFormat: FileFormat.unknown));
    }
  }

  /// Write binary data to temporary file and return path to it
  Future<File> _writeTempFile(Uint8List stream) async {
    final directory = (await getApplicationDocumentsDirectory()).path;
    final file = File('$directory/data');
    file.writeAsBytesSync(stream);
    return file;
  }

  /// Determine whether attachment belong to the password shared by user
  bool get _isSharedByUser => _ownerId > -1 && _publicKey != null;

  /// Determine whether attachment belong to the password shared by team
  bool get _isSharedByTeam => _teamId > -1 && _teamKey != null;
}
