import 'package:equatable/equatable.dart';
import 'package:telnor/model/configuration.dart';

class ConfigurationState extends Equatable {
  const ConfigurationState({
    required this.isLoading,
    required this.configuration,
  });

  factory ConfigurationState.initial() => ConfigurationState(
    isLoading: true,
    configuration: RemoteConfiguration.initial,
  );

  final bool isLoading;
  final RemoteConfiguration configuration;

  ConfigurationState copyWith({
    bool? isLoading,
    RemoteConfiguration? configuration,
  }) => ConfigurationState(
    isLoading: isLoading ?? this.isLoading,
    configuration: configuration ?? this.configuration,
  );

  @override
  List<Object> get props => [configuration];
}
