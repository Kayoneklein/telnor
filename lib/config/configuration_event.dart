import 'package:equatable/equatable.dart';
import 'package:telnor/model/configuration.dart';

abstract class ConfigurationEvent extends Equatable {
  const ConfigurationEvent();

  @override
  List<Object> get props => [];
}

/// Configuration loading requested
class ReloadRequested extends ConfigurationEvent {}

/// Configuration loading finished
class ConfigurationLoadFinished extends ConfigurationEvent {
  const ConfigurationLoadFinished({
    required this.isSuccess,
    this.configuration,
  });

  final bool isSuccess;
  final RemoteConfiguration? configuration;

  @override
  List<Object> get props => [isSuccess];
}
