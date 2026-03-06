import 'dart:io';

import 'package:equatable/equatable.dart';

import 'file_viewer.dart';



class FileViewerState extends Equatable {
  const FileViewerState({
    required this.title,
    required this.isLoading,
    required this.isError,
    required this.fileFormat,
    required this.fileData,
  });

  factory FileViewerState.initial(String title) {
    return FileViewerState(
      title: title,
      isLoading: true,
      isError: false,
      fileFormat: FileFormat.none,
      fileData: null,
    );
  }

  final String title;
  final bool isLoading;
  final bool isError;
  final FileFormat fileFormat;
  final File? fileData;

  @override
  List<Object> get props => [title, isLoading, fileFormat];

  FileViewerState copyWith({
    String? title,
    bool? isLoading,
    bool? isError,
    FileFormat? fileFormat,
    File? fileData,
  }) {
    return FileViewerState(
      title: title ?? this.title,
      isLoading: isLoading ?? this.isLoading,
      isError: isError ?? this.isError,
      fileFormat: fileFormat ?? this.fileFormat,
      fileData: fileData ?? this.fileData,
    );
  }
}

/// User needs to return to login screen
class SessionExpiredState extends FileViewerState {
  SessionExpiredState.from(FileViewerState state)
      : super(
    title: state.title,
    isLoading: false,
    isError: false,
    fileFormat: FileFormat.none,
    fileData: null,
  );
}

class ConnectionErrorState extends FileViewerState {
  ConnectionErrorState.from(FileViewerState state, {this.errorMessage = ''})
      : super(
    title: state.title,
    isLoading: false,
    isError: false,
    fileFormat: FileFormat.none,
    fileData: null,
  );

  final String errorMessage;

  @override
  List<Object> get props => [errorMessage];
}

