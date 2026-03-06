import 'package:built_collection/built_collection.dart';
import 'package:equatable/equatable.dart';
import 'package:telnor/model/filter.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/model/sorting_order.dart';
import 'package:telnor/model/team.dart';

class PasswordsState extends Equatable {
  const PasswordsState({
    required this.myPasswords,
    required this.sharedPasswords,
    required this.myTeams,
    required this.myMembers,
    required this.filteredPasswords,
    required this.allGroups,
    required this.allFilters,
    required this.positionFilters,
    required this.tagFilters,
    // required this.teamFilters,
    // required this.userFilters,
    required this.otherFilters,
    required this.currentFilter,
    required this.allSortingOrders,
    required this.currentSortingOrder,
    required this.isSearchVisible,
    required this.searchQuery,
    required this.selectionModeActive,
    required this.selectedPasswordIds,
    required this.currentShareInfo,
    required this.isPasswordsAvailable,
    required this.isLoading,
    required this.isLoadingError,
    this.isFromAutoFillRequestedApp = false,
    required this.veryFirstTimeLogin,
    required this.isReadOnlyMode,
  });

  factory PasswordsState.initial() => PasswordsState(
    myPasswords: BuiltList(<Password>[]),
    sharedPasswords: BuiltList(<Password>[]),
    myTeams: BuiltList(<Team>[]),
    myMembers: BuiltList(<TeamMember>[]),
    filteredPasswords: BuiltList(<Password>[]),
    allGroups: BuiltList(<Group>[]),
    allFilters: const <Filter>[],
    positionFilters: const <Filter>[],
    tagFilters: const <Filter>[],
    // teamFilters: const <Filter>[],
    // userFilters: const <Filter>[],
    otherFilters: const <Filter>[],
    currentFilter: AllFilter(),
    allSortingOrders: BuiltList.from(<PasswordSortingOrder>[
      PasswordSortingOrder.nameAZ,
      PasswordSortingOrder.nameZA,
      PasswordSortingOrder.tagAZ,
      PasswordSortingOrder.tagZA,
      PasswordSortingOrder.created,
    ]),
    currentSortingOrder: PasswordSortingOrder.nameAZ,
    isSearchVisible: false,
    searchQuery: '',
    selectionModeActive: false,
    selectedPasswordIds: BuiltSet(<int>{}),
    currentShareInfo: null,
    isPasswordsAvailable: false,
    isLoading: true,
    isLoadingError: false,
    veryFirstTimeLogin: false,
    isReadOnlyMode: false,
  );

  final BuiltList<Password> myPasswords;
  final BuiltList<Password> sharedPasswords;
  final BuiltList<Team> myTeams;
  final BuiltList<TeamMember> myMembers;
  final BuiltList<Password> filteredPasswords;
  final BuiltList<Group> allGroups;
  final List<Filter> allFilters;
  final List<Filter> positionFilters;
  final List<Filter> tagFilters;

  // final List<Filter> teamFilters;
  // final List<Filter> userFilters;
  final List<Filter> otherFilters;
  final Filter currentFilter;
  final BuiltList<PasswordSortingOrder> allSortingOrders;
  final PasswordSortingOrder currentSortingOrder;
  final bool isSearchVisible;
  final String searchQuery;
  final bool selectionModeActive;
  final BuiltSet<int> selectedPasswordIds;
  final PasswordShareInfo? currentShareInfo;
  final bool isPasswordsAvailable;
  final bool isLoading;
  final bool isLoadingError;
  final bool isFromAutoFillRequestedApp;
  final bool veryFirstTimeLogin;
  final bool isReadOnlyMode;

  int get totalFilesUploaded =>
      myPasswords.map((p) => p.files.length).fold(0, (a, b) => a + b);

  int get newPasswordsCount =>
      sharedPasswords.where((p) => p.isNewlyShared).length;

  PasswordsState copyWith({
    BuiltList<Password>? myPasswords,
    BuiltList<Password>? sharedPasswords,
    BuiltList<Team>? myTeams,
    BuiltList<TeamMember>? myMembers,
    BuiltList<Password>? filteredPasswords,
    BuiltList<Group>? allGroups,
    List<Filter>? allFilters,
    List<Filter>? positionFilters,
    List<Filter>? tagFilters,
    // List<Filter>? teamFilters,
    // List<Filter>? userFilters,
    List<Filter>? otherFilters,
    Filter? currentFilter,
    BuiltList<PasswordSortingOrder>? allSortingOrders,
    PasswordSortingOrder? currentSortingOrder,
    bool? isSearchVisible,
    String? searchQuery,
    bool? selectionModeActive,
    BuiltSet<int>? selectedPasswordIds,
    PasswordShareInfo? currentShareInfo,
    bool? isPasswordsAvailable,
    bool? isLoading,
    bool? isLoadingError,
    bool? veryFirstTimeLogin,
    bool? isReadOnlyMode,
  }) {
    return PasswordsState(
      myPasswords: myPasswords ?? this.myPasswords,
      sharedPasswords: sharedPasswords ?? this.sharedPasswords,
      myTeams: myTeams ?? this.myTeams,
      myMembers: myMembers ?? this.myMembers,
      filteredPasswords: filteredPasswords ?? this.filteredPasswords,
      allGroups: allGroups ?? this.allGroups,
      allFilters: allFilters ?? this.allFilters,
      positionFilters: positionFilters ?? this.positionFilters,
      tagFilters: tagFilters ?? this.tagFilters,
      // teamFilters: teamFilters ?? this.teamFilters,
      // userFilters: userFilters ?? this.userFilters,
      otherFilters: otherFilters ?? this.otherFilters,
      currentFilter: currentFilter ?? this.currentFilter,
      allSortingOrders: allSortingOrders ?? this.allSortingOrders,
      currentSortingOrder: currentSortingOrder ?? this.currentSortingOrder,
      isSearchVisible: isSearchVisible ?? this.isSearchVisible,
      searchQuery: searchQuery ?? this.searchQuery,
      selectionModeActive: selectionModeActive ?? this.selectionModeActive,
      selectedPasswordIds: selectedPasswordIds ?? this.selectedPasswordIds,
      currentShareInfo: currentShareInfo ?? this.currentShareInfo,
      isPasswordsAvailable: isPasswordsAvailable ?? this.isPasswordsAvailable,
      isLoading: isLoading ?? this.isLoading,
      isLoadingError: isLoadingError ?? this.isLoadingError,
      veryFirstTimeLogin: veryFirstTimeLogin ?? this.veryFirstTimeLogin,
      isReadOnlyMode: isReadOnlyMode ?? this.isReadOnlyMode,
    );
  }

  @override
  List<Object> get props => [
    myPasswords,
    sharedPasswords,
    filteredPasswords,
    allGroups,
    allFilters,
    positionFilters,
    tagFilters,
    // teamFilters,
    // userFilters,
    otherFilters,
    currentFilter,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedPasswordIds,
    currentShareInfo ?? '',
    isPasswordsAvailable,
    isLoading,
    isLoadingError,
    veryFirstTimeLogin,
    isReadOnlyMode,
  ];
}

/// Show passwords update message
class PasswordsSavedState extends PasswordsState {
  PasswordsSavedState.from(
    PasswordsState state, {
    required this.isSavedSuccessfully,
  }) : super(
         myPasswords: state.myPasswords,
         sharedPasswords: state.sharedPasswords,
         myTeams: state.myTeams,
         myMembers: state.myMembers,
         filteredPasswords: state.filteredPasswords,
         allGroups: state.allGroups,
         allFilters: state.allFilters,
         positionFilters: state.positionFilters,
         tagFilters: state.tagFilters,
         // teamFilters: state.teamFilters,
         // userFilters: state.userFilters,
         otherFilters: state.otherFilters,
         currentFilter: state.currentFilter,
         allSortingOrders: state.allSortingOrders,
         currentSortingOrder: state.currentSortingOrder,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         selectionModeActive: state.selectionModeActive,
         selectedPasswordIds: state.selectedPasswordIds,
         currentShareInfo: state.currentShareInfo,
         isPasswordsAvailable: state.isPasswordsAvailable,
         isLoading: false,
         isLoadingError: state.isLoadingError,
         veryFirstTimeLogin: state.veryFirstTimeLogin,
         isReadOnlyMode: state.isReadOnlyMode,
       );

  final bool isSavedSuccessfully;

  @override
  List<Object> get props => [
    myPasswords,
    sharedPasswords,
    filteredPasswords,
    allGroups,
    allFilters,
    positionFilters,
    tagFilters,
    // teamFilters,
    // userFilters,
    otherFilters,
    currentFilter,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedPasswordIds,
    currentShareInfo ?? '',
    isPasswordsAvailable,
    isLoading,
    isLoadingError,
    isSavedSuccessfully,
    veryFirstTimeLogin,
    isReadOnlyMode,
  ];
}

/// User is permitted to share selected passwords
class SharingPermittedState extends PasswordsState {
  SharingPermittedState.from(
    PasswordsState state, {
    required this.passwordsToShare,
  }) : super(
         myPasswords: state.myPasswords,
         sharedPasswords: state.sharedPasswords,
         myTeams: state.myTeams,
         myMembers: state.myMembers,
         filteredPasswords: state.filteredPasswords,
         allGroups: state.allGroups,
         allFilters: state.allFilters,
         positionFilters: state.positionFilters,
         tagFilters: state.tagFilters,
         // teamFilters: state.teamFilters,
         // userFilters: state.userFilters,
         otherFilters: state.otherFilters,
         currentFilter: state.currentFilter,
         allSortingOrders: state.allSortingOrders,
         currentSortingOrder: state.currentSortingOrder,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         selectionModeActive: state.selectionModeActive,
         selectedPasswordIds: state.selectedPasswordIds,
         currentShareInfo: state.currentShareInfo,
         isPasswordsAvailable: state.isPasswordsAvailable,
         isLoading: false,
         isLoadingError: state.isLoadingError,
         veryFirstTimeLogin: state.veryFirstTimeLogin,
         isReadOnlyMode: state.isReadOnlyMode,
       );

  final DateTime _timestamp = DateTime.now();
  final List<Password> passwordsToShare;

  @override
  List<Object> get props => [_timestamp];
}

/// Show passwords shared message
class PasswordsSharedState extends PasswordsState {
  PasswordsSharedState.from(
    PasswordsState state, {
    required this.isSharedSuccessfully,
  }) : super(
         myPasswords: state.myPasswords,
         sharedPasswords: state.sharedPasswords,
         myTeams: state.myTeams,
         myMembers: state.myMembers,
         filteredPasswords: state.filteredPasswords,
         allGroups: state.allGroups,
         allFilters: state.allFilters,
         positionFilters: state.positionFilters,
         tagFilters: state.tagFilters,
         // teamFilters: state.teamFilters,
         // userFilters: state.userFilters,
         otherFilters: state.otherFilters,
         currentFilter: state.currentFilter,
         allSortingOrders: state.allSortingOrders,
         currentSortingOrder: state.currentSortingOrder,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         selectionModeActive: state.selectionModeActive,
         selectedPasswordIds: state.selectedPasswordIds,
         currentShareInfo: state.currentShareInfo,
         isPasswordsAvailable: state.isPasswordsAvailable,
         isLoading: false,
         isLoadingError: state.isLoadingError,
         veryFirstTimeLogin: state.veryFirstTimeLogin,
         isReadOnlyMode: state.isReadOnlyMode,
       );

  final bool isSharedSuccessfully;

  @override
  List<Object> get props => [
    myPasswords,
    sharedPasswords,
    filteredPasswords,
    allGroups,
    allFilters,
    positionFilters,
    tagFilters,
    // teamFilters,
    // userFilters,
    otherFilters,
    currentFilter,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedPasswordIds,
    currentShareInfo ?? '',
    isPasswordsAvailable,
    isLoading,
    isLoadingError,
    isSharedSuccessfully,
    veryFirstTimeLogin,
    isReadOnlyMode,
  ];
}

/// Show message about location service error
class LocationServiceErrorState extends PasswordsState {
  LocationServiceErrorState.from(PasswordsState state)
    : super(
        myPasswords: state.myPasswords,
        sharedPasswords: state.sharedPasswords,
        myTeams: state.myTeams,
        myMembers: state.myMembers,
        filteredPasswords: state.filteredPasswords,
        allGroups: state.allGroups,
        allFilters: state.allFilters,
        positionFilters: state.positionFilters,
        tagFilters: state.tagFilters,
        // teamFilters: state.teamFilters,
        // userFilters: state.userFilters,
        otherFilters: state.otherFilters,
        currentFilter: state.currentFilter,
        allSortingOrders: state.allSortingOrders,
        currentSortingOrder: state.currentSortingOrder,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        selectionModeActive: state.selectionModeActive,
        selectedPasswordIds: state.selectedPasswordIds,
        currentShareInfo: state.currentShareInfo,
        isPasswordsAvailable: state.isPasswordsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
        veryFirstTimeLogin: state.veryFirstTimeLogin,
        isReadOnlyMode: state.isReadOnlyMode,
      );
}

/// Show dialog about restrictions for non-premium users
class PremiumRequiredState extends PasswordsState {
  PremiumRequiredState.from(PasswordsState state)
    : super(
        myPasswords: state.myPasswords,
        sharedPasswords: state.sharedPasswords,
        myTeams: state.myTeams,
        myMembers: state.myMembers,
        filteredPasswords: state.filteredPasswords,
        allGroups: state.allGroups,
        allFilters: state.allFilters,
        positionFilters: state.positionFilters,
        tagFilters: state.tagFilters,
        // teamFilters: state.teamFilters,
        // userFilters: state.userFilters,
        otherFilters: state.otherFilters,
        currentFilter: state.currentFilter,
        allSortingOrders: state.allSortingOrders,
        currentSortingOrder: state.currentSortingOrder,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        selectionModeActive: state.selectionModeActive,
        selectedPasswordIds: state.selectedPasswordIds,
        currentShareInfo: state.currentShareInfo,
        isPasswordsAvailable: state.isPasswordsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
        veryFirstTimeLogin: state.veryFirstTimeLogin,
        isReadOnlyMode: state.isReadOnlyMode,
      );

  final DateTime _timestamp = DateTime.now();

  @override
  List<Object> get props => [_timestamp];
}

/// Show dialog about restrictions for non-premium users
class AutoFillManagerState extends PasswordsState {
  AutoFillManagerState.from(PasswordsState state)
    : super(
        myPasswords: state.myPasswords,
        sharedPasswords: state.sharedPasswords,
        myTeams: state.myTeams,
        myMembers: state.myMembers,
        filteredPasswords: state.filteredPasswords,
        allGroups: state.allGroups,
        allFilters: state.allFilters,
        positionFilters: state.positionFilters,
        tagFilters: state.tagFilters,
        // teamFilters: state.teamFilters,
        // userFilters: state.userFilters,
        otherFilters: state.otherFilters,
        currentFilter: state.currentFilter,
        allSortingOrders: state.allSortingOrders,
        currentSortingOrder: state.currentSortingOrder,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        selectionModeActive: state.selectionModeActive,
        selectedPasswordIds: state.selectedPasswordIds,
        currentShareInfo: state.currentShareInfo,
        isPasswordsAvailable: state.isPasswordsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
        isFromAutoFillRequestedApp: true,
        veryFirstTimeLogin: state.veryFirstTimeLogin,
        isReadOnlyMode: state.isReadOnlyMode,
      );
}

/// Log out from the system
class SessionExpiredState extends PasswordsState {
  SessionExpiredState()
    : super(
        myPasswords: BuiltList(<Password>[]),
        sharedPasswords: BuiltList(<Password>[]),
        myTeams: BuiltList(<Team>[]),
        myMembers: BuiltList(<TeamMember>[]),
        filteredPasswords: BuiltList(<Password>[]),
        allGroups: BuiltList(<Group>[]),
        allFilters: const <Filter>[],
        positionFilters: const <Filter>[],
        tagFilters: const <Filter>[],
        // teamFilters: const <Filter>[],
        // userFilters: const <Filter>[],
        otherFilters: const <Filter>[],
        currentFilter: AllFilter(),
        allSortingOrders: BuiltList(<PasswordSortingOrder>[]),
        currentSortingOrder: PasswordSortingOrder.nameAZ,
        isSearchVisible: false,
        searchQuery: '',
        selectionModeActive: false,
        selectedPasswordIds: BuiltSet(<int>{}),
        currentShareInfo: null,
        isPasswordsAvailable: false,
        isLoading: false,
        isLoadingError: false,
        veryFirstTimeLogin: false,
        isReadOnlyMode: false,
      );
}

///Show save password toast
class ShowSavePasswordToastState extends PasswordsState {
  ShowSavePasswordToastState()
    : super(
        myPasswords: BuiltList(<Password>[]),
        sharedPasswords: BuiltList(<Password>[]),
        myTeams: BuiltList(<Team>[]),
        myMembers: BuiltList(<TeamMember>[]),
        filteredPasswords: BuiltList(<Password>[]),
        allGroups: BuiltList(<Group>[]),
        allFilters: const <Filter>[],
        positionFilters: const <Filter>[],
        tagFilters: const <Filter>[],
        // teamFilters: const <Filter>[],
        // userFilters: const <Filter>[],
        otherFilters: const <Filter>[],
        currentFilter: AllFilter(),
        allSortingOrders: BuiltList(<PasswordSortingOrder>[]),
        currentSortingOrder: PasswordSortingOrder.nameAZ,
        isSearchVisible: false,
        searchQuery: '',
        selectionModeActive: false,
        selectedPasswordIds: BuiltSet(<int>{}),
        currentShareInfo: null,
        isPasswordsAvailable: false,
        isLoading: false,
        isLoadingError: false,
        veryFirstTimeLogin: false,
        isReadOnlyMode: false,
      );
}

/// Ask if user wants to save new password or update an existing one
class SaveOrUpdateConfirmationRequestedState extends PasswordsState {
  SaveOrUpdateConfirmationRequestedState.from(
    PasswordsState state, {
    required this.receivedPassword,
    required this.passwords,
    required this.teamsList,
    required this.membersList,
  }) : super(
         myPasswords: state.myPasswords,
         sharedPasswords: state.sharedPasswords,
         myTeams: state.myTeams,
         myMembers: state.myMembers,
         filteredPasswords: state.filteredPasswords,
         allGroups: state.allGroups,
         allFilters: state.allFilters,
         positionFilters: state.positionFilters,
         tagFilters: state.tagFilters,
         // teamFilters: state.teamFilters,
         // userFilters: state.userFilters,
         otherFilters: state.otherFilters,
         currentFilter: state.currentFilter,
         allSortingOrders: state.allSortingOrders,
         currentSortingOrder: state.currentSortingOrder,
         isSearchVisible: state.isSearchVisible,
         searchQuery: state.searchQuery,
         selectionModeActive: state.selectionModeActive,
         selectedPasswordIds: state.selectedPasswordIds,
         currentShareInfo: state.currentShareInfo,
         isPasswordsAvailable: state.isPasswordsAvailable,
         isLoading: false,
         isLoadingError: state.isLoadingError,
         veryFirstTimeLogin: state.veryFirstTimeLogin,
         isReadOnlyMode: state.isReadOnlyMode,
       );

  final Map<String, dynamic> receivedPassword;
  final BuiltList<Password> passwords;
  final List<Team> teamsList;
  final List<TeamMember> membersList;

  @override
  List<Object> get props => [
    receivedPassword,
    passwords,
    teamsList,
    membersList,
    myPasswords,
    sharedPasswords,
    filteredPasswords,
    allGroups,
    allFilters,
    positionFilters,
    tagFilters,
    // teamFilters,
    // userFilters,
    otherFilters,
    currentFilter,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedPasswordIds,
    currentShareInfo ?? '',
    isPasswordsAvailable,
    isLoading,
    isLoadingError,
    veryFirstTimeLogin,
    isReadOnlyMode,
  ];
}

class ConnectionErrorState extends PasswordsState {
  ConnectionErrorState.from(PasswordsState state, {required this.errorMessage})
    : super(
        myPasswords: state.myPasswords,
        sharedPasswords: state.sharedPasswords,
        myTeams: state.myTeams,
        myMembers: state.myMembers,
        filteredPasswords: state.filteredPasswords,
        allGroups: state.allGroups,
        allFilters: state.allFilters,
        positionFilters: state.positionFilters,
        tagFilters: state.tagFilters,
        // teamFilters: state.teamFilters,
        // userFilters: state.userFilters,
        otherFilters: state.otherFilters,
        currentFilter: state.currentFilter,
        allSortingOrders: state.allSortingOrders,
        currentSortingOrder: state.currentSortingOrder,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        selectionModeActive: state.selectionModeActive,
        selectedPasswordIds: state.selectedPasswordIds,
        currentShareInfo: state.currentShareInfo,
        isPasswordsAvailable: state.isPasswordsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
        veryFirstTimeLogin: state.veryFirstTimeLogin,
        isReadOnlyMode: state.isReadOnlyMode,
      );

  final String errorMessage;

  @override
  List<Object> get props => [
    errorMessage,
    myPasswords,
    sharedPasswords,
    filteredPasswords,
    allGroups,
    allFilters,
    positionFilters,
    tagFilters,
    // teamFilters,
    // userFilters,
    otherFilters,
    currentFilter,
    allSortingOrders,
    currentSortingOrder,
    isSearchVisible,
    searchQuery,
    selectionModeActive,
    selectedPasswordIds,
    currentShareInfo ?? '',
    isPasswordsAvailable,
    isLoading,
    isLoadingError,
    veryFirstTimeLogin,
    isReadOnlyMode,
  ];
}

///Show cannot update request on readonly mode
class ShowReadOnlyModeToastState extends PasswordsState {
  ShowReadOnlyModeToastState.from(PasswordsState state)
    : super(
        myPasswords: state.myPasswords,
        sharedPasswords: state.sharedPasswords,
        myTeams: state.myTeams,
        myMembers: state.myMembers,
        filteredPasswords: state.filteredPasswords,
        allGroups: state.allGroups,
        allFilters: state.allFilters,
        positionFilters: state.positionFilters,
        tagFilters: state.tagFilters,
        // teamFilters: const <Filter>[],
        // userFilters: const <Filter>[],
        otherFilters: state.otherFilters,
        currentFilter: state.currentFilter,
        allSortingOrders: state.allSortingOrders,
        currentSortingOrder: state.currentSortingOrder,
        isSearchVisible: state.isSearchVisible,
        searchQuery: state.searchQuery,
        selectionModeActive: state.selectionModeActive,
        selectedPasswordIds: state.selectedPasswordIds,
        currentShareInfo: state.currentShareInfo,
        isPasswordsAvailable: state.isPasswordsAvailable,
        isLoading: false,
        isLoadingError: state.isLoadingError,
        veryFirstTimeLogin: state.veryFirstTimeLogin,
        isReadOnlyMode: state.isReadOnlyMode,
      );
}
