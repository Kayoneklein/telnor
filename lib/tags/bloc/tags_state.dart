import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/group.dart';

class TagsState extends Equatable {
  const TagsState({
    required this.tags,
    required this.isTagsAvailable,
    required this.isLoading,
    required this.isLoadingError,
  });

  factory TagsState.initial() => TagsState(
    tags: BuiltList(<Group>[]),
    isTagsAvailable: false,
    isLoading: true,
    isLoadingError: false,
  );

  final BuiltList<Group> tags;
  final bool isTagsAvailable;
  final bool isLoading;
  final bool isLoadingError;

  TagsState copyWith({
    BuiltList<Group>? tags,
    bool? isTagsAvailable,
    bool? isLoading,
    bool? isLoadingError,
  }) {
    return TagsState(
      tags: tags ?? this.tags,
      isTagsAvailable: isTagsAvailable ?? this.isTagsAvailable,
      isLoading: isLoading ?? this.isLoading,
      isLoadingError: isLoadingError ?? this.isLoadingError,
    );
  }

  @override
  List<Object> get props => [tags, isTagsAvailable, isLoading, isLoadingError];
}

/// Show tags update message
class TagsSavedState extends TagsState {
  TagsSavedState.from(TagsState state, {required this.isSavedSuccessfully})
    : super(
        tags: state.tags,
        isTagsAvailable: state.isTagsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
      );

  final bool isSavedSuccessfully;

  @override
  List<Object> get props => [
    tags,
    isTagsAvailable,
    isLoading,
    isLoadingError,
    isSavedSuccessfully,
  ];
}

/// Show tag creation dialog and proceed creating tag
class TagCreationPermittedState extends TagsState {
  TagCreationPermittedState.from(TagsState state)
    : super(
        tags: state.tags,
        isTagsAvailable: state.isTagsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
      );

  final DateTime _timestamp = DateTime.now();

  @override
  List<Object> get props => [_timestamp];
}

/// Show dialog about restrictions for non-premium users
class PremiumRequiredState extends TagsState {
  PremiumRequiredState.from(TagsState state)
    : super(
        tags: state.tags,
        isTagsAvailable: state.isTagsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
      );

  final DateTime _timestamp = DateTime.now();

  @override
  List<Object> get props => [_timestamp];
}

/// Log out from the system
class SessionExpiredState extends TagsState {
  SessionExpiredState()
    : super(
        tags: BuiltList(<Group>[]),
        isTagsAvailable: false,
        isLoading: false,
        isLoadingError: false,
      );

  @override
  List<Object> get props => [tags, isTagsAvailable, isLoading, isLoadingError];
}

class ConnectionErrorState extends TagsState {
  ConnectionErrorState.from(TagsState state, {required this.errorMessage})
    : super(
        isLoadingError: state.isLoadingError,
        isLoading: false,
        isTagsAvailable: state.isTagsAvailable,
        tags: state.tags,
      );

  final String errorMessage;
  @override
  List<Object> get props => [
    errorMessage,
    isLoading,
    isLoadingError,
    tags,
    isTagsAvailable,
  ];
}
