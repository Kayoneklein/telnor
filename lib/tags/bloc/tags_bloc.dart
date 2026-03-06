import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:built_collection/built_collection.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/web/server_adapter.dart';

import './tags.dart';

class TagsBloc extends Bloc<TagsEvent, TagsState> {
  TagsBloc({bool isPremium = false})
    : _restrictedFunctionality = !isPremium,
      super(TagsState.initial()) {
    _loadGroups();
    on<TagsEvent>((event, emit) {
      //Groups loaded
      if (event is GroupsLoaded) {
        if (event.groups == null) {
          emit(
            state.copyWith(
              isTagsAvailable: false,
              isLoading: false,
              isLoadingError: true,
            ),
          );
        } else {
          emit(
            state.copyWith(
              tags: event.groups,
              isTagsAvailable: true,
              isLoading: false,
              isLoadingError: false,
            ),
          );
        }
      }
      //Retry pressed
      if (event is RetryPressed) {
        _loadGroups();
        emit(state.copyWith(isLoading: true, isLoadingError: false));
      }
      //Create Tag pressed
      if (event is AddTagPressed) {
        if (_restrictedFunctionality && state.tags.length >= 3) {
          emit(PremiumRequiredState.from(state));
        } else {
          emit(TagCreationPermittedState.from(state));
        }
      }
      //Tag added
      if (event is TagAdded) {
        final Group group = Group(
          id: Group.randomId,
          name: event.name,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        final groups = state.tags.rebuild((b) => b.add(group));
        _saveGroups(groups);
        emit(state.copyWith(isLoading: true, tags: groups));
      }
      //Tag renamed
      if (event is TagRenamed) {
        final Group group = Group(
          id: event.tag.id,
          name: event.newName,
          createdAt: event.tag.createdAt,
          updatedAt: DateTime.now(),
        );
        final int index = state.tags.indexWhere((g) => g.id == event.tag.id);
        final BuiltList<Group> groups = state.tags.rebuild(
          (b) => b
            ..removeAt(index)
            ..insert(index, group),
        );
        _saveGroups(groups);
        emit(state.copyWith(isLoading: true, tags: groups));
      }
      //Tag deleted
      if (event is TagDeleted) {
        final BuiltList<Group> groups = state.tags.rebuild(
          (b) => b.removeWhere((g) => g.id == event.tag.id),
        );
        _saveGroups(groups);
        emit(state.copyWith(isLoading: true, tags: groups));
      }
      //Tags saved
      if (event is TagsSaved) {
        emit(TagsSavedState.from(state, isSavedSuccessfully: event.isSuccess));
      }
      //Session expired
      if (event is SessionExpired) {
        emit(SessionExpiredState());
      }

      if (event is ConnectionErrorEvent) {
        emit(
          ConnectionErrorState.from(state, errorMessage: event.errorMessage),
        );
      }
    });
  }

  final ServerAdapter _server = ServerAdapter.get;
  final bool _restrictedFunctionality;

  /*  @override
  Stream<TagsState> mapEventToState(
    TagsEvent event,
  ) async* {
    //Groups loaded
    if (event is GroupsLoaded) {
      if (event.groups == null) {
        yield state.copyWith(
          isTagsAvailable: false,
          isLoading: false,
          isLoadingError: true,
        );
      } else {
        yield state.copyWith(
          tags: event.groups,
          isTagsAvailable: true,
          isLoading: false,
          isLoadingError: false,
        );
      }
    }
    //Retry pressed
    if (event is RetryPressed) {
      _loadGroups();
      yield state.copyWith(
        isLoading: true,
        isLoadingError: false,
      );
    }
    //Create Tag pressed
    if (event is AddTagPressed) {
      if (_restrictedFunctionality && state.tags.length >= 3) {
        yield PremiumRequiredState.from(state);
      } else {
        yield TagCreationPermittedState.from(state);
      }
    }
    //Tag added
    if (event is TagAdded) {
      final Group group = Group(
        id: Group.randomId,
        name: event.name,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      final groups = state.tags.rebuild((b) => b.add(group));
      _saveGroups(groups);
      yield state.copyWith(
        isLoading: true,
        tags: groups,
      );
    }
    //Tag renamed
    if (event is TagRenamed) {
      final Group group = Group(
        id: event.tag.id,
        name: event.newName,
        createdAt: event.tag.createdAt,
        updatedAt: DateTime.now(),
      );
      final int index = state.tags.indexWhere((g) => g.id == event.tag.id);
      final BuiltList<Group> groups = state.tags.rebuild((b) => b
        ..removeAt(index)
        ..insert(index, group));
      _saveGroups(groups);
      yield state.copyWith(
        isLoading: true,
        tags: groups,
      );
    }
    //Tag deleted
    if (event is TagDeleted) {
      final BuiltList<Group> groups = state.tags.rebuild((b) => b.removeWhere((g) => g.id == event.tag.id));
      _saveGroups(groups);
      yield state.copyWith(
        isLoading: true,
        tags: groups,
      );
    }
    //Tags saved
    if (event is TagsSaved) {
      yield TagsSavedState.from(state, isSavedSuccessfully: event.isSuccess);
    }
    //Session expired
    if (event is SessionExpired) {
      yield SessionExpiredState();
    }

    if (event is ConnectionErrorEvent) {
      yield ConnectionErrorState.from(state, errorMessage: event.errorMessage);
    }
  }*/

  //--------------------------------------------------------------------------------------------------------------------

  /// Loads list of groups (tags) for current user
  void _loadGroups() {
    _server.loadGroups(
      onSuccess: (groups) {
        add(GroupsLoaded(groups: BuiltList.from(groups)));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else if (error.isSessionExpired) {
          add(SessionExpired());
        } else {
          add(const GroupsLoaded(groups: null));
        }
      },
    );
  }

  /// Saves list of groups (tags) for current user
  void _saveGroups(BuiltList<Group> groups) {
    _server.saveGroups(
      groups: groups.toList(),
      onSuccess: () {
        add(const TagsSaved(isSuccess: true));
      },
      onError: (error) {
        if (error.isConnectionError) {
          add(ConnectionErrorEvent(errorMessage: error.message));
        } else if (error.isSessionExpired) {
          add(SessionExpired());
        } else {
          add(const TagsSaved(isSuccess: false));
        }
      },
    );
  }
}
