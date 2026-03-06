import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/group.dart';

abstract class TagsEvent extends Equatable {
  const TagsEvent();

  @override
  List<Object> get props => [];
}

/// List of groups loaded from the server
class GroupsLoaded extends TagsEvent {
  const GroupsLoaded({required this.groups});

  final BuiltList<Group>? groups;

  @override
  List<Object> get props => [groups ?? const <Group>[].toBuiltList()];
}

/// User pressed Retry button
class RetryPressed extends TagsEvent {}

/// User pressed Create Tag button
class AddTagPressed extends TagsEvent {}

/// User added new tag
class TagAdded extends TagsEvent {
  const TagAdded({required this.name});

  final String name;

  @override
  List<Object> get props => [name];
}

/// User renamed a tag
class TagRenamed extends TagsEvent {
  const TagRenamed({required this.tag, required this.newName});

  final Group tag;
  final String newName;

  @override
  List<Object> get props => [tag, newName];
}

/// User deleted tag
class TagDeleted extends TagsEvent {
  const TagDeleted({required this.tag});

  final Group tag;

  @override
  List<Object> get props => [tag];
}

/// Tags saved to the server
class TagsSaved extends TagsEvent {
  const TagsSaved({required this.isSuccess});

  final bool isSuccess;

  @override
  List<Object> get props => [isSuccess];
}

/// Session expired
class SessionExpired extends TagsEvent {}

/// Event for when user somehow is not able to connect to the server
class ConnectionErrorEvent extends TagsEvent {
  const ConnectionErrorEvent({this.errorMessage = ''});

  final String errorMessage;
}
