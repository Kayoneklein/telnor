import 'dart:io';

import 'package:equatable/equatable.dart';

import 'file_viewer.dart';

class FileViewerEvent extends Equatable {
  const FileViewerEvent();

  @override
  List<Object> get props => [];
}

/// File data loaded
class FileLoaded extends FileViewerEvent {
  const FileLoaded({
    required this.isSuccess,
    this.fileFormat,
    this.fileData,
  });

  final bool isSuccess;
  final FileFormat? fileFormat;
  final File? fileData;

  @override
  List<Object> get props => [isSuccess];
}

/// User pressed Retry button
class RetryPressed extends FileViewerEvent {}

/// User canceled the form
class SessionExpired extends FileViewerEvent {}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends FileViewerEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}