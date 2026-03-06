import 'package:built_collection/built_collection.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/util/strings.dart';

/// Abstract class for filtering passwords
///
/// Filtering implies executing [test] method against supplied password to define whether it is accepted by current filter
/// Shortcut [filterList] method tests a [List] of passwords and returns only those that comply
/// Shortcut [filterBuiltList] foes the same for immutable [BuiltList]
/// Filter also needs to supply [name] to be used on UI screens
abstract class Filter {
  String get name;

  bool test(Password password);

  List<Password> filterList(List<Password> passwords) {
    return passwords.where((p) => test(p)).toList();
  }

  BuiltList<Password> filterBuiltList(BuiltList<Password> passwords) {
    return passwords.rebuild((b) => b.retainWhere((p) => test(p)));
  }

  @override
  String toString() => name;
}

/// [Filter] implementation that accepts any password
class AllFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterAll;

  @override
  bool test(Password password) => true;
}

/// [Filter] implementation that accepts only passwords within location
class LocationFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterLocation;

  @override
  bool test(Password password) => password.locations.isNotEmpty;
}

/// [Filter] implementation that accepts passwords without tags
class NoTagsFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterWithoutTags;

  @override
  bool test(Password password) => password.groupIds.isEmpty;
}

/// [Filter] implementation that accepts only passwords created by current user
class CreatedByMeFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterCreatedByMe;

  @override
  bool test(Password password) => !password.isShared;
}

/// [Filter] implementation that accepts only passwords shared by current user
class SharedByMeFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterSharedByMe;

  @override
  bool test(Password password) =>
      !password.isShared &&
      (password.shares.isNotEmpty || password.shareTeamIds.isNotEmpty);
}

/// [Filter] implementation that accepts only passwords shared by other users
class SharedWithMeFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterSharedWithMe;

  @override
  bool test(Password password) => password.isShared;
}

/// [Filter] implementation that accepts only passwords shared by other users
class NewSharesFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterNewShares;

  @override
  bool test(Password password) => password.isShared && password.isNewlyShared;
}

/// [Filter] implementation that accepts only passwords in specific group
class GroupFilter extends Filter {
  GroupFilter(this.group);

  final Group group;

  @override
  String get name => group.name;

  @override
  bool test(Password password) => password.groupIds.contains(group.id);
}

/// [Filter] implementation which filters passwords created by specific member
class CreatorFilter extends Filter implements Comparable<CreatorFilter> {
  CreatorFilter(this.userId, this.email);

  final int userId;
  final String email;

  @override
  String get name => email;

  @override
  bool test(Password password) {
    if (password.creator == null) {
      return password.shares.keys.contains(userId);
    } else {
      if (password.type != null) {
        return (password.type == PasswordType.userShare) &&
            (password.creator?.userId == userId);
      } else {
        return password.creator?.userId == userId;
      }
    }
  }

  @override
  int compareTo(CreatorFilter other) {
    return userId.compareTo(other.userId);
  }
}

/// [Filter] implementation which filters passwords created by specific team
class TeamFilter extends Filter implements Comparable<TeamFilter> {
  TeamFilter(this.teamId, this.teamName);

  final int teamId;
  final String teamName;

  @override
  String get name => teamName;

  @override
  bool test(Password password) {
    if (password.creator == null) {
      return password.shares[0]?.contains(teamId) == true;
    } else {
      if (password.type != null) {
        return (password.type == PasswordType.teamShare) &&
            (password.creator?.teamId == teamId);
      } else {
        return password.creator?.teamId == teamId;
      }
    }
  }

  @override
  int compareTo(TeamFilter other) {
    return teamName.compareTo(other.teamName);
  }
}

class AlarmFilter extends Filter {
  @override
  String get name => Strings.passwordsFilterAlarmExceeded; // TODO: work on l10

  @override
  bool test(Password password) {
    final now = DateTime.now();
    final DateTime? alarmTime = password.alarm;

    return alarmTime != null && now.isAfter(alarmTime);
  }
}
