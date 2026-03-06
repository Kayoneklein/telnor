import 'localization.dart';

// ignore: avoid_classes_with_only_static_members
abstract class Strings {
  static String get appName => l10n('default', 'PCPROGRAMTITLE');

  static String get tourGuideTitle1 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDETITLE1');

  static String get tourGuideMessage1 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDEMESSAGE1');

  static String get newTourGuideMessage1 =>
      l10n('flutterapp', 'PCFLUTTERTNEWOURGUIDEMESSAGE1');

  static String get tourGuideTitle2 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDETITLE2');

  static String get tourGuideMessage2 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDEMESSAGE2');

  static String get tourGuideTitle3 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDETITLE3');

  static String get tourGuideMessage3 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDEMESSAGE3');

  static String get tourGuideTitle4 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDETITLE4');

  static String get tourGuideMessage4 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDEMESSAGE4');

  static String get tourGuideTitle5 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDETITLE5');

  static String get tourGuideMessage5 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDEMESSAGE5');

  static String get tourGuideTitle6 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDETITLE6');

  static String get tourGuideMessage6 =>
      l10n('flutterapp', 'PCFLUTTERTOURGUIDEMESSAGE6');

  static String get loginTitle => l10n('login', 'PCLOGINLOGINBUTTON');

  static String get loginUsername => l10n('login', 'PCLOGINUSERNAME');

  static String get loginUsernameEmpty =>
      l10n('flutterapp', 'PCFLUTTERLOGINUSERNAMEEMPTY');

  static String get authLocalizedReason =>
      l10n('flutterapp', 'PCFLUTTERAUTHLOCALIZEDREASON');

  static String get authSignInTitle =>
      l10n('flutterapp', 'PCFLUTTERAUTHSIGNINTITLE');

  static String get biometric => l10n('flutterapp', 'PCFLUTTERAUTHBIOMETRIC');

  static String get loginPassword => l10n('login', 'PCLOGINPASSWORD');

  static String get loginAutoLogout => l10n('login', 'PCLOGINAUTOLOGOUTTITLE');

  static String get loginAutoLogoutNever =>
      l10n('login', 'PCLOGINAUTOLOGOUTNONE');

  static String get loginAutoLogoutMin2 => l10n('login', 'PCLOGINAUTOLOGOUT2');

  static String get loginAutoLogoutMin5 => l10n('login', 'PCLOGINAUTOLOGOUT5');

  static String get loginAutoLogoutMin10 =>
      l10n('login', 'PCLOGINAUTOLOGOUT10');

  static String get loginAutoLogoutMin15 =>
      l10n('login', 'PCLOGINAUTOLOGOUT15');

  static String get loginAutoLogoutMin30 =>
      l10n('login', 'PCLOGINAUTOLOGOUT30');

  static String get loginAutoLogoutHour1 =>
      l10n('login', 'PCLOGINAUTOLOGOUT60');

  static String get loginAutoLogoutHour4 =>
      l10n('login', 'PCLOGINAUTOLOGOUT240');

  static String get loginBiometrics =>
      l10n('flutterapp', 'PCFLUTTERLOGINBIOMETRICS');

  static String get loginBiometricsCheckbox =>
      l10n('flutterapp', 'PCFLUTTERLOGINBIOMETRICSCHECKBOX');

  static String get loginPasswordEmpty =>
      l10n('flutterapp', 'PCFLUTTERLOGINPASSWORDEMPTY');

  static String get loginForgotPassword =>
      l10n('flutterapp', 'PCFLUTTERLOGINFORGOTPASSWORD');

  static String get loginDontHaveAnAccount =>
      l10n('login', 'PCLOGINCREATEACCOUNTTEXT');

  static String get loginSignUp => l10n('login', 'PCLOGINSIGNUP');

  static String get loginPinRequiredTitle =>
      l10n('mobilejs', 'PCAPPLOGING2FACTORTITLE');

  static String get loginPinRequiredHint =>
      l10n('flutterapp', 'PCFLUTTERLOGINPINREQUIREDHINT');

  static String get loginPinRequiredEmpty =>
      l10n('flutterapp', 'PCFLUTTERLOGINPINREQUIREDEMPTY');

  static String get loginError => l10n('mobilejs', 'PCAPPERROR');

  static String get loginErrorUnknownUser =>
      l10n('mobilejs', 'PCAPPLOGINUNKNOWNUSER');

  static String get loginErrorInvalidPassword =>
      l10n('mobilejs', 'PCAPPLOGINWRONGPASSWORD');

  static String get loginErrorEmailNotValidated =>
      l10n('mobilejs', 'PCAPPLOGINEMAILNOTVALIDATED');

  static String get loginPasswordManagerTitle =>
      l10n('flutterapp', 'PCFLUTTERSELECTOSPMTITLE');

  static String get loginPasswordManagerMessage =>
      l10n('flutterapp', 'PCFLUTTERSELECTOSPMMESSAGE');

  static String get loginPasswordManagerOption =>
      l10n('flutterapp', 'PCFLUTTERSELECTOSPMLINK');

  static String get loginServerManagerTitle =>
      l10n('flutterapp', 'PCFLUTTERSELECTSERVERTITLE');

  static String get loginServerManagerMessage =>
      l10n('flutterapp', 'PCFLUTTERSELECTSERVERMESSAGE');

  static String get loginSettingsTitle =>
      l10n('passwords', 'PCPASSWORDADVANCEDSETTINGS');

  static String get loginSettingsDefaultServer =>
      l10n('extension', 'EXTDEFAULTSERVER');

  static String get loginSettingsCustomServer =>
      l10n('extension', 'EXTCUSTOMSERVER');

  static String get loginSettingsErrorEmptyUrl =>
      l10n('extension', 'EXTUNDEFURL');

  static String get loginSettingsChooseServer =>
      l10n('flutterapp', 'EXTCHOOSESERVER');

  static String get loginSettingsErrorInvalidUrl =>
      l10n('flutterapp', 'PCFLUTTERLOGINSETTINGSERRORINVAL');

  static String get loginSettingsDiscardChanges =>
      l10n('flutterapp', 'PCFLUTTERLOGINSETTINGSDISCARDCHA');

  static String get forgotPasswordTitle =>
      l10n('flutterapp', 'PCFLUTTERFORGOTPASSWORDTITLE');

  static String get unverifiedEmailTitle =>
      l10n('flutterapp', 'PCFLUTTERUNVERIFIEDEMAILTITLE');

  static String get unverifiedEmailMessage =>
      l10n('flutterapp', 'PCFLUTTERUNVERIFIEDEMAILMESSAGE');

  static String get signUpTitle => l10n('login', 'PCLOGINCREATEBUTTON');

  static String get signUpEmail => l10n('login', 'PCLOGINUSERNAME');

  static String get signUpEmailEmpty =>
      l10n('flutterapp', 'PCFLUTTERSIGNUPEMAILEMPTY');

  static String get signUpPassword => l10n('login', 'PCLOGINPASSWORD');

  static String get signUpPasswordEmpty =>
      l10n('flutterapp', 'PCFLUTTERSIGNUPPASSWORDEMPTY');

  static String get signUpError => l10n('mobilejs', 'PCAPPERROR');

  static String get signUpErrorInvalidEmail =>
      l10n('accountjs', 'PCACCOUNTNOTVALIDEMAIL');

  static String get signUpErrorAccountExists =>
      l10n('accountjs', 'PCACCOUNTUSEREXIST');

  static String get biometricLockTitle =>
      l10n('flutterapp', 'PCFLUTTERBIOMETRICLOCKTITLE');

  static String get biometricLockPrompt =>
      l10n('flutterapp', 'PCFLUTTERBIOMETRICLOCKPROMPT');

  static String get biometricLockSuccess =>
      l10n('flutterapp', 'PCFLUTTERBIOMETRICLOCKSUCCESS');

  static String get biometricLockFailure =>
      l10n('flutterapp', 'PCFLUTTERBIOMETRICLOCKFAILURE');

  static String get passwordsTitle => l10n('mobilejs', 'PCAPPPASSWORDS');

  static String get passwordsSelected =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSSELECTED');

  static String get passwordsErrorLoad =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSERRORLOAD');

  static String get passwordsEmptyTitle =>
      l10n('passwordsjs', 'PCPASSWORDSNOCONTENT');

  static String get passwordsEmptyMessage =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSEMPTYMESSAGE');

  static String get passwordsEmptyTagMessage =>
      l10n('flutterapp', 'PCFLUTTERNOPASSWORDSFORTAG');

  static String get passwordsNotFoundMessage =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSNOTFOUNDMESSAG');

  static String get passwordsFilterAll =>
      l10n('passwords', 'PCPASSWORDFILTERALL');

  static String get passwordsFilterLocation =>
      l10n('passwords', 'PCPASSWORDFILTERPOS');

  static String get passwordsFilterWithoutTags =>
      l10n('passwordsjs', 'PCPASSWORDSGROUPUNDEFINED');

  static String get passwordsFilterCreatedByMe =>
      l10n('passwordsjs', 'PCPASSWORDSGROUPOWN');

  static String get passwordsFilterSharedWithMe =>
      l10n('passwordsjs', 'PCPASSWORDSGROUPSHAREDIN');

  static String get passwordsFilterSharedByMe =>
      l10n('passwordsjs', 'PCPASSWORDSGROUPSHAREDOUT');

  static String get passwordsFilterNewShares =>
      l10n('passwordsjs', 'PCPASSWORDSGROUPNEWSHARES');

  static String get passwordsFilterAlarmExceeded =>
      'Alarm exceeded'; //TODO: FIX l10
  static String get passwordsFilterTagsList =>
      l10n('passwords', 'PCPASSWORDFILTERTAGS');

  static String get passwordsFilterTeamsList =>
      l10n('passwords', 'PCPASSWORDFILTERTEAMSHARES');

  static String get passwordsFilterMembersList =>
      l10n('passwords', 'PCPASSWORDFILTERUSERSHARES');

  static String get passwordsFilterOther =>
      l10n('passwords', 'PCPASSWORDFILTEROTHER');

  static String get passwordsUpdateSuccess =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSUPDATESUCCESS');

  static String get passwordsUpdateFailTitle => l10n('mobilejs', 'PCAPPERROR');

  static String get passwordsUpdateFailMessage =>
      l10n('mobilejs', 'PCAPPERRORUPDATING');

  static String get passwordsShareSuccess =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSSHARESUCCESS');

  static String get readOnlyToastAlert =>
      l10n('flutterapp', 'PCFLUTTERREADONLYTOASTALERT');

  static String get passwordsShareFailTitle => l10n('mobilejs', 'PCAPPERROR');

  static String get passwordsShareFailMessage =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSSHAREFAILMESSA');

  static String get passwordsLocationError =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSLOCATIONERROR');

  static String get passwordsDeleteConfirmation =>
      l10n('passwords', 'PCPASSWORDEDITDELETECONFIRM');

  static String get passwordsDeleteSelectedConfirmation =>
      l10n('passwordsjs', 'PCPASSWORDSDELETECONFIRM');

  static String get passwordsShareInfoTitle =>
      l10n('passwordsjs', 'PCPASSWORDSTITLESHAREINFO');

  static String get passwordsShareInfoUser =>
      l10n('passwordsjs', 'PCPASSWORDSSHARETEXT1');

  static String get passwordsShareInfoThroughTeams =>
      l10n('passwordsjs', 'PCPASSWORDSSHARETEXT2');

  static String get passwordsShareInfoWithTeams =>
      l10n('passwordsjs', 'PCPASSWORDSSHARETEXT2TEAM');

  static String get passwordName => l10n('mobilejs', 'PCAPPNAME');

  static String get passwordUsername => l10n('mobilejs', 'PCAPPUSERNAME');

  static String get passwordPassword => l10n('mobilejs', 'PCAPPPASSWORD');

  static String get passwordUrl => l10n('mobilejs', 'PCAPPURL');

  static String get passwordNotes => l10n('mobilejs', 'PCAPPNOTE');

  static String get passwordTags => l10n('mobilejs', 'PCAPPGROUP');

  static String get passwordLocations => l10n('mobilejs', 'PCAPPPOS');

  static String get passwordAttachments => l10n('mobilejs', 'PCAPPFILES');

  static String get passwordCreated =>
      l10n('passwords', 'PCPASSWORDEDITCREATED');

  static String get passwordUpdated =>
      l10n('passwords', 'PCPASSWORDEDITUPDATED');

  static String get passwordCopied =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDCOPIED');

  static String get passwordAdd => l10n('mobilejs', 'PCAPPADDNEWPASSWORD');

  static String get passwordEdit => l10n('mobilejs', 'PCAPPEDITPASSWORD');

  static String get passwordNameEmpty =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDNAMEEMPTY');

  static String get passwordUsernameEmpty =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDUSERNAMEEMPTY');

  static String get passwordPasswordEmpty =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDPASSWORDEMPTY');

  static String get passwordUrlInvalid => l10n('extension', 'EXTUNDEFURL');

  static String get passwordSetTags => l10n('passwords', 'PCPASSWORDEDITTAGS');

  static String get passwordTagsCreateNew => l10n('default', 'PCADDNEWTAG');

  static String get passwordTagsName =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDTAGSNAME');

  static String get passwordTagsNameEmpty =>
      l10n('passwordsjs', 'PCPEGROUPADDTITLE');

  static String get passwordAddLocation =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDADDLOCATION');

  static String get passwordShowAllLocations =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSHOWALLLOCATION');

  static String get passwordEditLocation =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDEDITLOCATION');

  static String get passwordLocationTitle =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDLOCATIONTITLE');

  static String get passwordLocationLatitude =>
      l10n('mobilejs', 'PCAPPLATITUDE');

  static String get passwordLocationLatitudeInvalid =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDLOCATIONLATITUD');

  static String get passwordLocationLongitude =>
      l10n('mobilejs', 'PCAPPLONGITUDE');

  static String get passwordLocationLongitudeInvalid =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDLOCATIONLONGITU');

  static String get passwordLocationAccuracy =>
      l10n('mobilejs', 'PCAPPACCURACY');

  static String get passwordLocationAccuracyInvalid =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDLOCATIONACCURAC');

  static String get passwordLocationGetCurrent =>
      l10n('passwordeditjs', 'PCPELOCMYLOCATION');

  static String get passwordLocationGetAddress =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDLOCATIONGETADDR');

  static String get passwordLocationEnterAddress =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDLOCATIONENTERAD');

  static String get passwordLocationAddressError =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDLOCATIONADDRESS');

  static String get passwordUploadFile =>
      l10n('passwords', 'PCPASSWORDBUTTONFILEUPLOAD');

  static String get passwordError => l10n('mobilejs', 'PCAPPERROR');

  static String get passwordDiscardChangesPrompt =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDDISCARDCHANGESP');

  static String get passwordGroupsLoadingError =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDGROUPSLOADINGER');

  static String get memberPickerTeamsTitle =>
      l10n('flutterapp', 'PCFLUTTERMEMBERPICKERTEAMSTITLE');

  static String get memberPickerMembersTitle =>
      l10n('flutterapp', 'PCFLUTTERMEMBERPICKERTITLE');

  static String get memberPickerErrorLoad =>
      l10n('flutterapp', 'PCFLUTTERMEMBERPICKERERRORLOAD');

  static String get memberPickerEmptyTitle =>
      l10n('passwordsjs', 'PCPASSWORDSNOCONTENT');

  static String get memberPickerEmptyMessage =>
      l10n('flutterapp', 'PCFLUTTERMEMBERPICKEREMPTYMESSAG');

  static String get memberPickerTeam => l10n('share', 'PCSHARETEAMLABEL');

  static String get memberPickerAll =>
      l10n('mobilejs', 'PCAPPPASSWORDSGROUPALL');

  static String get memberPickerTabTeams => l10n('share', 'PCSHARETEAMTAB');

  static String get memberPickerTabMembers => l10n('share', 'PCSHAREUSERTAB');

  static String get memberPickerTabEmail => l10n('share', 'PCSHARENEWTAB');

  static String get memberPickerEmail => l10n('share', 'PCSHAREEMAILLABEL');

  static String get memberPickerAddMember =>
      l10n('share', 'PCSHAREBUTTONADDMEMBER');

  static String get memberPickerEmailEmptyTitle =>
      l10n('flutterapp', 'PCFLUTTERMEMBERPICKEREMAILEMPTYT');

  static String get memberPickerEmailEmptyMessage =>
      l10n('flutterapp', 'PCFLUTTERMEMBERPICKEREMAILEMPTYM');

  static String get memberPickerEmailProcessingError =>
      l10n('flutterapp', 'PCFLUTTERMEMBERPICKEREMAILPROCES');

  static String get memberPickerEmailUnprocessedTitle =>
      l10n('default', 'PCPROGRAMTITLE');

  static String get memberPickerEmailUnprocessedMessage =>
      l10n('default', 'PCNEWSHAREUSERTEXT');

  static String get sortingOrderNameAZ =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERNAMEAZ');

  static String get sortingOrderNameZA =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERNAMEZA');

  static String get sortingOrderTagAZ =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERTAGAZ');

  static String get sortingOrderTagZA =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERTAGZA');

  static String get sortingOrderSubjectAZ =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERSUBJECTAZ');

  static String get sortingOrderSubjectZA =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERSUBJECTZA');

  static String get sortingOrderMemberAZ =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERMEMBERAZ');

  static String get sortingOrderMemberZA =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERMEMBERZA');

  static String get sortingOrderCreated =>
      l10n('flutterapp', 'PCFLUTTERSORTINGORDERCREATED');

  static String get sessionExpiredTitle =>
      l10n('flutterapp', 'PCFLUTTERSESSIONEXPIREDTITLE');

  static String get sessionExpiredMessage =>
      l10n('default', 'PCUSERSESSIONINVALID');

  static String get logoutPromptMessage =>
      l10n('flutterapp', 'PCFLUTTERLOGOUTPROMPTMESSAGE');

  static String get tabPasswords => l10n('mobilejs', 'PCAPPPASSWORDS');

  static String get tabMessages => l10n('messages', 'PCMAILUSERMESSAGES');

  static String get tabNotifications =>
      l10n('flutterapp', 'PCFLUTTERTABNOTIFICATIONS');

  static String get messagesTitle => l10n('messages', 'PCMAILUSERMESSAGES');

  static String get messagesInbox => l10n('messages', 'PCMAILBUTTONIN');

  static String get messagesOutbox => l10n('messages', 'PCMAILBUTTONOUT');

  static String get messagesSelected =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESSELECTED');

  static String get messagesErrorLoad =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESERRORLOAD');

  static String get messagesEmptyTitle =>
      l10n('passwordsjs', 'PCPASSWORDSNOCONTENT');

  static String get messagesEmptyMessage =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESEMPTYMESSAGE');

  static String get messagesNotFoundMessage =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESNOTFOUNDMESSAGE');

  static String get messagesDeleteConfirmation =>
      l10n('admin', 'PCADMINMESSAGESDELETEMESSAGE');

  static String get messagesDeleteSelectedConfirmation =>
      l10n('admin', 'PCADMINDELETINGMESSAGESWARNING');

  static String get messagesDeleteSuccess =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESDELETESUCCESS');

  static String get messagesDeleteFailure =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESDELETEFAILURE');

  static String get messagesSendSuccess =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESSENDSUCCESS');

  static String get messagesSendFailure =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESSENDFAILURE');

  static String get messageSend => l10n('flutterapp', 'PCFLUTTERMESSAGESEND');

  static String get messageSubject => l10n('messages', 'PCMAILSUBJECTTITLE');

  static String get messageSubjectEmpty =>
      l10n('flutterapp', 'PCFLUTTERMESSAGESUBJECTEMPTY');

  static String get messageRecipient =>
      l10n('messages', 'PCMAILBUTTONEDITSHARE');

  static String get messageFrom => l10n('mailjs', 'PCMAILFROMTITLE');

  static String get messageTo => l10n('mailjs', 'PCMAILTOTITLE');

  static String get messageMessage => l10n('messages', 'PCMAILCONTENTTITLE');

  static String get messageDiscardChangesPrompt =>
      l10n('flutterapp', 'PCFLUTTERMESSAGEDISCARDCHANGESPR');

  static String get notificationsTitle =>
      l10n('flutterapp', 'PCFLUTTERNOTIFICATIONSTITLE');

  static String get notificationsErrorLoad =>
      l10n('flutterapp', 'PCFLUTTERNOTIFICATIONSERRORLOAD');

  static String get notificationsEmptyTitle =>
      l10n('passwordsjs', 'PCPASSWORDSNOCONTENT');

  static String get notificationsEmptyMessage =>
      l10n('flutterapp', 'PCFLUTTERNOTIFICATIONSEMPTYMESSA');

  static String get notificationsNotFoundMessage =>
      l10n('flutterapp', 'PCFLUTTERNOTIFICATIONSNOTFOUNDME');

  static String get notificationTopic => l10n('admin', 'PCADMINMESSAGESTOPIC');

  static String get notificationContent =>
      l10n('admin', 'PCADMINMESSAGESMESSAGEHEADER');

  static String get notificationCreated =>
      l10n('admin', 'PCADMINMESSAGECREATEDHEADER');

  static String get drawerAccountFree =>
      l10n('topmenu', 'PCTOPMENUPREMIUMFALSE');

  static String get drawerAccountPremium =>
      l10n('topmenu', 'PCTOPMENUPREMIUMTRUE');

  static String get drawerAccountTrial =>
      l10n('topmenu', 'PCTOPMENUPREMIUMTRIAL');

  static String get drawerGetPremium => l10n('popup', 'PCPOPUPBUTTONBUY');

  static String get drawerMenuItemUserInfo =>
      l10n('account', 'PCACCOUNTBUTTONUPDATETEAMINFO');

  static String get drawerMenuItemAccountInfo =>
      l10n('flutterapp', 'PCFLUTTERDRAWERMENUITEMACCOUNTIN');

  static String get drawerMenuItemSettings =>
      l10n('flutterapp', 'PCFLUTTERDRAWERMENUITEMSETTINGS');

  static String get drawerMenuItemSystemSettings =>
      l10n('flutterapp', 'PCFLUTTERDRAWERMENUITEMSETTINGS');

  static String get drawerMenuItemRestoreData =>
      l10n('account', 'PCACCOUNTBUTTONRESTORE');

  static String get drawerMenuItemLogs => l10n('account', 'PCACCOUNTBUTTONLOG');

  static String get drawerMenuItemManageSubscription =>
      l10n('premium', 'PCPREMIUMSUBSCRIPTIONS');

  static String get drawerMenuItemTagsManager =>
      l10n('flutterapp', 'PCFLUTTERDRAWERMENUITEMTAGSMANAG');

  static String get drawerMenuItemSecurity =>
      l10n('flutterapp', 'PCFLUTTERDRAWERMENUITEMSECURITY');

  static String get drawerMenuItemUserManual =>
      l10n('topmenu', 'PCTOPMENUMANUAL');

  static String get drawerMenuItemUserForum =>
      l10n('topmenu', 'PCTOPMENUFORUM');

  static String get fileViewerErrorLoad =>
      l10n('flutterapp', 'PCFLUTTERFILEVIEWERERRORLOAD');

  static String get fileViewerUnknownFormat =>
      l10n('passwordeditjs', 'PCPEUNKNOWNFILETYPE');

  static String get uploadFileTitle =>
      l10n('passwords', 'PCPASSWORDBUTTONFILEUPLOAD');

  static String get uploadFileChooseType =>
      l10n('flutterapp', 'PCFLUTTERUPLOADFILECHOOSETYPE');

  static String get uploadFileTypeImage =>
      l10n('flutterapp', 'PCFLUTTERUPLOADFILETYPEIMAGE');

  static String get uploadFileTypePDF =>
      l10n('flutterapp', 'PCFLUTTERUPLOADFILETYPEPDF');

  static String get uploadFileTypeOther =>
      l10n('flutterapp', 'PCFLUTTERUPLOADFILETYPEOTHER');

  static String get uploadFileResultSuccess =>
      l10n('flutterapp', 'PCFLUTTERUPLOADFILERESULTSUCCESS');

  static String get uploadFileResultStorageFull =>
      l10n('flutterapp', 'PCFLUTTERUPLOADFILERESULTSTORAGE');

  static String get uploadFileResultFail =>
      l10n('flutterapp', 'PCFLUTTERUPLOADFILERESULTFAIL');

  static String get tagsTitle => l10n('flutterapp', 'PCFLUTTERTAGSTITLE');

  static String get tagsErrorLoad =>
      l10n('flutterapp', 'PCFLUTTERTAGSERRORLOAD');

  static String get tagsEmptyTitle =>
      l10n('passwordsjs', 'PCPASSWORDSNOCONTENT');

  static String get tagsEmptyMessage =>
      l10n('flutterapp', 'PCFLUTTERTAGSEMPTYMESSAGE');

  static String get tagsAdd => l10n('default', 'PCADDNEWTAG');

  static String get tagsRename => l10n('groupeditjs', 'PCGROUPEDITCHANGETITLE');

  static String get tagsName => l10n('flutterapp', 'PCFLUTTERTAGSNAME');

  static String get tagsNameEmpty =>
      l10n('flutterapp', 'PCFLUTTERTAGSNAMEEMPTY');

  static String get tagsDeleteConfirmation =>
      l10n('groupsjs', 'PCGROUPSDELETECONFIRM');

  static String get tagsUpdateSuccess =>
      l10n('flutterapp', 'PCFLUTTERTAGSUPDATESUCCESS');

  static String get tagsUpdateFailTitle => l10n('mobilejs', 'PCAPPERROR');

  static String get tagsUpdateFailMessage =>
      l10n('flutterapp', 'PCFLUTTERTAGSUPDATEFAILMESSAGE');

  static String get settingsTitle =>
      l10n('flutterapp', 'PCFLUTTERSETTINGSTITLE');

  static String get settingsChooseLanguage =>
      l10n('flutterapp', 'PCFLUTTERSETTINGSCHOOSELANGUAGE');

  static String get settingsDiscardChanges =>
      l10n('flutterapp', 'PCFLUTTERSETTINGSDISCARDCHANGES');

  static String get settingsErrorChangingLanguage =>
      l10n('flutterapp', 'PCFLUTTERSETTINGSERRORCHANGINGLA');

  static String get settingsAutoFillSetting =>
      l10n('flutterapp', 'PCFLUTTERSETTINGSAUTOFILLSETTING');

  static String get userInfoTitle =>
      l10n('account', 'PCACCOUNTBUTTONUPDATETEAMINFO');

  static String get userInfoName => l10n('team', 'PCTEAMUSEREDITNAME');

  static String get userInfoDepartment =>
      l10n('team', 'PCTEAMUSEREDITDEPARTMENT');

  static String get userInfoAvatar =>
      l10n('account', 'PCACCOUNTTEAMAVATARLABEL');

  static String get userInfoUploadAvatar =>
      l10n('account', 'PCACCOUNTBUTTONAVATARUPLOAD');

  static String get userInfoChooseAvatarSource =>
      'Choose source:'; //!!! no l10n
  static String get userInfoAvatarSourcePhoto => 'From camera'; //!!! no l10n
  static String get userInfoAvatarSourceGallery => 'From gallery'; //!!! no l10n
  static String get userInfoDeleteAvatar =>
      l10n('account', 'PCACCOUNTBUTTONAVATARDELETE');

  static String get userInfoDiscardChanges =>
      l10n('flutterapp', 'PCFLUTTERUSERINFODISCARDCHANGES');

  static String get userInfoSaveError =>
      l10n('flutterapp', 'PCFLUTTERUSERINFOSAVEERROR');

  static String get accountInfoTitle => l10n('flutterapp', ''); //TODO add
  static String get accountInfoNewPassword =>
      l10n('account', 'PCACCOUNTNEWPASSLABEL');

  static String get accountInfoNewPasswordEmpty =>
      l10n('flutterapp', ''); //TODO add
  static String get accountInfoConfirmPassword =>
      l10n('account', 'PCACCOUNTCONFIRMNEWPASSLABEL');

  static String get accountInfoConfirmPasswordDifferent =>
      l10n('flutterapp', ''); //TODO add
  static String get accountInfoDiscardChanges =>
      l10n('flutterapp', ''); //TODO add
  static String get accountInfoSaveError => l10n('flutterapp', ''); //TODO add

  static String get premiumRequiredTitle =>
      l10n('flutterapp', 'PCFLUTTERPREMIUMREQUIREDTITLE');

  static String get premiumRequiredMessage =>
      l10n('flutterapp', 'PCFLUTTERPREMIUMREQUIREDMESSAGE');

  static String get premiumFeaturesTitle =>
      l10n('flutterapp', 'PCFLUTTERPREMIUMFEATURESTITLE');

  static String get premiumFeaturesMessage =>
      l10n('flutterapp', 'PCFLUTTERPREMIUMFEATURESMESSAGE');

  static String get actionCancel => l10n('default', 'PCBUTTONCANCEL');

  static String get actionClear => l10n('flutterapp', 'PCFLUTTERACTIONCLEAR');

  static String get actionClose => l10n('default', 'PCBUTTONCLOSE');

  static String get actionConfirm => l10n('premiumjs', 'PCPREMIUMJSCONFIRM');

  static String get actionCopy => l10n('passwordsjs', 'PCPASSWORDSCOPYTITLE');

  static String get actionCreate =>
      l10n('passwords', 'PCPASSWORDEDITSUBMITCREATE');

  static String get actionDelete =>
      l10n('passwords', 'PCPASSWORDEDITBUTTONDELETE');

  static String get actionDetails =>
      l10n('flutterapp', 'PCFLUTTERACTIONDETAILS');

  static String get actionEdit => l10n('passwordsjs', 'PCPASSWORDSBUTTONEDIT');

  static String get actionFilter => l10n('flutterapp', 'PCFLUTTERACTIONFILTER');

  static String get actionForward => l10n('mailjs', 'PCMAILBUTTONFORWARD');

  static String get actionGuide =>
      l10n('passwords', 'PCPASSWORDSSTARTTOURGUIDE');

  static String get actionLogin => l10n('login', 'PCLOGINLOGINBUTTON');

  static String get actionLogout => l10n('mobilejs', 'PCAPPLOGOUT');

  static String get actionMore => l10n('mobilejs', 'PCAPPOTHER');

  static String get actionNo => l10n('flutterapp', 'PCFLUTTERACTIONNO');

  static String get actionOk => l10n('flutterapp', 'PCFLUTTERACTIONOK');

  static String get actionRename => l10n('flutterapp', 'PCFLUTTERACTIONRENAME');

  static String get actionReply => l10n('mailjs', 'PCMAILBUTTONREPLY');

  static String get actionRetry => l10n('flutterapp', 'PCFLUTTERACTIONRETRY');

  static String get actionSearch => l10n('flutterapp', 'PCFLUTTERACTIONSEARCH');

  static String get actionSelectAll =>
      l10n('flutterapp', 'PCFLUTTERACTIONSELECTALL');

  static String get actionDeselectAll =>
      l10n('flutterapp', 'PCFLUTTERACTIONDESELECTALL');

  static String get actionSend => l10n('contact', 'PCCONTACTSENDBUTTON');

  static String get actionSettings =>
      l10n('flutterapp', 'PCFLUTTERACTIONSETTINGS');

  static String get actionShare =>
      l10n('passwords', 'PCPASSWORDSSUSERMENUSHARE');

  static String get actionShareInfo =>
      l10n('passwordsjs', 'PCPASSWORDSBUTTONSHAREINFO');

  static String get actionSignUp => l10n('login', 'PCLOGINSIGNUP');

  static String get actionSort => l10n('flutterapp', 'PCFLUTTERACTIONSORT');

  static String get actionViewPassword => l10n('mobilejs', 'PCAPPVIEWPASSWORD');

  static String get actionHidePassword =>
      l10n('flutterapp', 'PCFLUTTERACTIONHIDEPASSWORD');

  static String get actionUpgrade =>
      l10n('flutterapp', 'PCFLUTTERACTIONUPGRADE');

  static String get actionYes => l10n('flutterapp', 'PCFLUTTERACTIONYES');

  static String get actionUpdateExistingPassword =>
      l10n('flutterapp', 'PCFLUTTERAUTOFILLPROMPTUPDATE');

  static String get actionSaveNewPassword =>
      l10n('flutterapp', 'PCFLUTTERAUTOFILLPROMPTSAVENEW');

  static String get messageSaveUpdateConfirmTitle =>
      l10n('flutterapp', 'PCFLUTTERAUTOFILLPROMPTTITLE');

  static String get messageUnknownError =>
      l10n('flutterapp', 'PCFLUTTERUNKNOWNERROR');

  static String get messageLocationDeniedPermanentlyAndroid =>
      l10n('flutterapp', 'PCFLUTTERLOCATIONDENIED');

  static String get messageLocationDenied =>
      l10n('flutterapp', 'PCFLUTTERLOCATIONNOTAVAILABLE');

  static String get messageUnableToEditShare =>
      l10n('flutterapp', 'PCFLUTTERUNABLETOEDITSHARE');

  static String get messageBioAuthCancelled =>
      l10n('flutterapp', 'PCFLUTTERBIOAUTHCANCELLED');

  static String get messagePasswordSavedSuccess =>
      l10n('flutterapp', 'PCFLUTTERPASSWORDSAVEDSUCCESS');

  static String get messageLocationDeniedPermanentlyIOS =>
      l10n('flutterapp', 'PCFLUTTERLOCATIONDENIEDIOS');

  static String get messageSelectEntryToUpdate =>
      l10n('flutterapp', 'PCFLUTTERSELECTUPDATEENTRYTITLE');

  static String get messageMakeAppPasswordManagerIOS1 =>
      l10n('flutterapp', 'PCFLUTTERSELECTOSPMMESSAGEIOS1');

  static String get messageMakeAppPasswordManagerIOS2 =>
      l10n('flutterapp', 'PCFLUTTERSELECTOSPMMESSAGEIOS2');

  ///DELETE ACCOUNT SCREEN
  static String get deleteAccountRemoveAccount =>
      l10n('login', 'PCLOGINREMOVEACCOUNT');

  static String get deleteAccountDeleteUserText =>
      l10n('account', 'PCACCOUNTDELETEUSERTEXT');

  static String get deleteAccountConfirmPasswordText =>
      l10n('default', 'PCPASSWORDSCONFIRMPASSWORDTEXT');

  static String get deleteAccountTerminateAccount =>
      l10n('flutterapp', 'PCFLUTTERTERMINATEACCOUNT');

  static String get deleteAccountEmailSentText =>
      l10n('flutterapp', 'PCFLUTTERDELETEEMAILSENT');

  ///READ ONLY MODE
  static String get unableToAccessReadOnly =>
      l10n('default', 'PCUNABLETOACCESSINREADONLYMODE');

  static String get readOnlyEnabled => l10n('default', 'PCREADONLYMODEENABLED');

  static String get readOnlyMode => l10n('default', 'PCREADONLYMODE');

  static String get deleteConfirmation =>
      l10n('flutterapp', 'PCDELETECONFIRMATION');

  static String get delete => l10n('flutterapp', 'PCDELETE');

  static String get deleteAccount => l10n('flutterapp', 'PCDELETEACCOUNT');

  static String get deleteAccountText1 =>
      l10n('flutterapp', 'PCDELETEACCOUNTTEXT1');

  static String get deleteAccountText2 =>
      l10n('flutterapp', 'PCDELETEACCOUNTTEXT2');

  static String get deleteAccountText3 =>
      l10n('flutterapp', 'PCDELETEACCOUNTTEXT3');

  static String get deleteAccountText4 =>
      l10n('flutterapp', 'PCDELETEACCOUNTTEXT4');
}
